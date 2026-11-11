from typing import Optional
from datetime import datetime, timezone


from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Event
from app.schemas import EventResponse, EventResponseFront
#from app.services.recommendations import get_recommendations

from app.services.student_feed import (
    _active_rsvp_counts,
    _category_names,
    _require_student,
    _rsvp_ids,
    _saved_ids,
    _to_feed_event,
    _upcoming_clause,
)

router = APIRouter(prefix="/api/events", tags=["Events"])


# ----------------------------------------------------------------------------
# ORIGINAL (kept for reference)
#
# Returned raw Event rows straight from the database through EventResponse.
# Problems with this version:
#   - Sent internal fields to the app: organizer_id, category_id, status.
#   - Sent category_id (a number) instead of the category name the card shows.
#   - No spots_left: the app had no way to show availability or block a full RSVP.
#   - No is_saved / is_rsvpd: the app needed 2 extra calls and had to match IDs itself.
#   - Included events that had already ended.
#
# @router.get("", response_model=list[EventResponse])
# def get_events(
#     search: Optional[str] = None,
#     category_id: Optional[int] = None,
#     session: Session = Depends(get_session),
# ):
#     statement = select(Event).where(Event.status == "active")
#
#     if search:
#         search_pattern = f"%{search}%"
#         statement = statement.where(
#             Event.title.ilike(search_pattern)
#             | Event.description.ilike(search_pattern)
#         )
#
#     if category_id is not None:
#         statement = statement.where(Event.category_id == category_id)
#
#     return session.exec(statement).all()
# ----------------------------------------------------------------------------


# ----------------------------------------------------------------------------
# NEW: same URL and same filters, but the response is wrapped.
#
# Idea:
#   The database row (Event) is for the backend. The app receives a separate,
#   student-facing shape (EventResponseFront). The backend does the work:
#     1. Query the Event table (same filters as before + hide ended events).
#     2. Look up what the card needs: category name, active RSVP counts,
#        and (if student_id is given) this student's saved / RSVP'd events.
#     3. Wrap each row with _to_feed_event: names in, spots_left calculated,
#        flags set, internal fields (organizer_id, category_id, status) dropped.
#
#   student_id is optional so the existing app keeps working:
#     /api/events                -> flags are false
#     /api/events?student_id=1   -> flags filled in for student 1
#
#   is_recommended is None here. Ranking only happens in the feed
#   (/api/students/{id}/feed), which is the main way the app loads events.
#   This route is a plain list, kept for compatibility and simple lookups.
# ----------------------------------------------------------------------------

@router.get("", response_model=list[EventResponseFront])
def get_events(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    student_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    now = datetime.now(timezone.utc)

    # 1. Query: same filters as the original, plus "hasn't ended yet"
    statement = select(Event).where(
        Event.status == "active",
        _upcoming_clause(now),
    )

    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(
            Event.title.ilike(search_pattern)
            | Event.description.ilike(search_pattern)
        )

    if category_id is not None:
        # category_id is still accepted as a filter. It's just not sent back.
        statement = statement.where(Event.category_id == category_id)

    events = session.exec(statement.order_by(Event.start_datetime)).all()

    # 2. Lookups the wrapper needs (one query each)
    categories = _category_names(session)
    rsvp_counts = _active_rsvp_counts(session, [e.event_id for e in events])

    if student_id is not None:
        _require_student(session, student_id)
        saved = _saved_ids(session, student_id)
        rsvpd = _rsvp_ids(session, student_id)
    else:
        saved, rsvpd = set(), set()          # no student → nothing saved or RSVP'd

    # 3. Wrap each row into EventResponseFront (is_recommended = None)
    return [
        _to_feed_event(e, categories, rsvp_counts, saved, rsvpd)
        for e in events
    ]

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
