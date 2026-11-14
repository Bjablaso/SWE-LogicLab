"""
Student engagement: save / unsave / RSVP / cancel, and the saved + RSVP lists.

Every route returns events in the student-facing shape (EventResponseFront),
the same shape as the feed, search, get_event and the view route. Internal data
(RSVP rows, saved_at, organizer_id, category_id, status) stays on the server.

Rules enforced here (so the app and every sync agree):
  - An event is either saved OR RSVP'd, never both. RSVP wins:
      * RSVPing a saved event removes the save
      * saving an RSVP'd event is rejected (409)
  - One active RSVP per student per event; active RSVPs can't exceed capacity
  - Only active, not-yet-ended events can be saved or RSVP'd
  - Unsave / cancel are idempotent: calling them twice is not an error
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Event, RSVP, SavedEvent, Student
from app.schemas import EventResponseFront
from app.services.student_feed import (
    _active_rsvp_counts,
    _category_names,
    _rsvp_ids,
    _saved_ids,
    _to_feed_event,
    _upcoming_clause,
    wrap_single_event,
)

router = APIRouter(prefix="/api/students", tags=["Student Engagement"])


# ---------------------------------------------------------------- checks

def _require_student(session: Session, student_id: int) -> None:
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")


def _require_live_event(session: Session, event_id: int) -> Event:
    """The event exists, is active, and hasn't ended."""
    event = session.get(Event, event_id)
    if event is None or event.status != "active":
        raise HTTPException(status_code=404, detail="Event not found")

    now = datetime.now(timezone.utc)
    ends = event.end_datetime or event.start_datetime
    if ends < now:
        raise HTTPException(status_code=409, detail="Event has already ended")
    return event


def _active_rsvp(session: Session, student_id: int, event_id: int) -> RSVP | None:
    return session.exec(
        select(RSVP).where(
            RSVP.student_id == student_id,
            RSVP.event_id == event_id,
            RSVP.status == "active",
        )
    ).first()


def _wrap_list(session: Session, student_id: int, events: list[Event]) -> list[dict]:
    """Many events → EventResponseFront shape (one query per lookup, not per event)."""
    categories = _category_names(session)
    rsvp_counts = _active_rsvp_counts(session, [e.event_id for e in events])
    saved = _saved_ids(session, student_id)
    rsvpd = _rsvp_ids(session, student_id)
    return [_to_feed_event(e, categories, rsvp_counts, saved, rsvpd) for e in events]


# ---------------------------------------------------------------- saved events

@router.post("/{student_id}/saved-events/{event_id}", response_model=EventResponseFront)
def save_event(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    event = _require_live_event(session, event_id)

    # RSVP wins: an RSVP'd event can't also be saved
    if _active_rsvp(session, student_id, event_id) is not None:
        raise HTTPException(status_code=409, detail="You're already attending this event")

    if session.get(SavedEvent, (student_id, event_id)) is None:
        session.add(SavedEvent(student_id=student_id, event_id=event_id))
        session.commit()

    return wrap_single_event(session, event, student_id)


@router.delete("/{student_id}/saved-events/{event_id}", response_model=EventResponseFront)
def unsave_event(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)

    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    # Idempotent: if it isn't saved, there's nothing to do
    saved_event = session.get(SavedEvent, (student_id, event_id))
    if saved_event is not None:
        session.delete(saved_event)
        session.commit()

    return wrap_single_event(session, event, student_id)


@router.get("/{student_id}/saved-events", response_model=list[EventResponseFront])
def get_saved_events(
    student_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    now = datetime.now(timezone.utc)

    events = session.exec(
        select(Event)
        .join(SavedEvent, SavedEvent.event_id == Event.event_id)
        .where(
            SavedEvent.student_id == student_id,
            Event.status == "active",
            _upcoming_clause(now),
        )
        .order_by(SavedEvent.saved_at.desc())      # most recently saved first
    ).all()

    return _wrap_list(session, student_id, list(events))


# ---------------------------------------------------------------- RSVPs

@router.post("/{student_id}/rsvps/{event_id}", response_model=EventResponseFront)
def create_rsvp(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    event = _require_live_event(session, event_id)

    rsvps = session.exec(
        select(RSVP).where(RSVP.student_id == student_id, RSVP.event_id == event_id)
    ).all()

    # One active RSVP per student per event
    if any(r.status == "active" for r in rsvps):
        raise HTTPException(status_code=409, detail="Student already has an active RSVP")

    # Capacity
    active_rsvp_count = session.exec(
        select(func.count())
        .select_from(RSVP)
        .where(RSVP.event_id == event_id, RSVP.status == "active")
    ).one()
    if event.capacity is not None and active_rsvp_count >= event.capacity:
        raise HTTPException(status_code=409, detail="Event is full")

    # Reuse the latest cancelled RSVP instead of creating a duplicate
    rsvp = max(rsvps, key=lambda r: r.created_at) if rsvps else None
    if rsvp is None:
        session.add(RSVP(student_id=student_id, event_id=event_id))
    else:
        rsvp.status = "active"
        rsvp.attended = False
        rsvp.created_at = datetime.now(timezone.utc)
        session.add(rsvp)

    # RSVP wins: remove the save, if there was one
    saved_event = session.get(SavedEvent, (student_id, event_id))
    if saved_event is not None:
        session.delete(saved_event)

    session.commit()
    return wrap_single_event(session, event, student_id)


@router.delete("/{student_id}/rsvps/{event_id}", response_model=EventResponseFront)
def cancel_rsvp(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)

    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    # Idempotent: if there's no active RSVP, there's nothing to cancel
    active = _active_rsvp(session, student_id, event_id)
    if active is not None:
        active.status = "cancelled"
        session.add(active)
        session.commit()

    return wrap_single_event(session, event, student_id)


@router.get("/{student_id}/rsvps", response_model=list[EventResponseFront])
def get_rsvps(
    student_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    now = datetime.now(timezone.utc)

    events = session.exec(
        select(Event)
        .join(RSVP, RSVP.event_id == Event.event_id)
        .where(
            RSVP.student_id == student_id,
            RSVP.status == "active",
            Event.status == "active",
            _upcoming_clause(now),               # past events drop off
        )
        .order_by(Event.start_datetime)          # soonest first
    ).all()

    return _wrap_list(session, student_id, list(events))


# ============================================================================
# ORIGINAL ROUTES (kept for reference; replaced by the versions above)
#
# Why they were replaced:
#   - Responses exposed internals: raw RSVP rows (rsvp_id, attended, created_at),
#     saved_at, and plain {message, student_id, event_id} objects. The app had to
#     make another request to learn what the event looked like after the change.
#   - Lists returned a slim shape (title, location, start only), so Saved and
#     Attending couldn't show the same card data as Discover.
#   - The "RSVP wins" rule only existed in the app. The backend kept both a save
#     and an RSVP, so the next feed sync brought removed saves back.
#   - Unsave / cancel returned 404 when called twice, which breaks optimistic UI
#     (update the screen first, then call the API).
#   - Events that had ended or been cancelled could still be saved or RSVP'd.
#   - get_rsvps returned past events too; the feed and Attending hide them.
#
# @router.post("/{student_id}/saved-events/{event_id}", response_model=OperationResponse)
# def save_event(student_id: int, event_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     _require_event(session, event_id)
#     saved_event = session.get(SavedEvent, (student_id, event_id))
#     if saved_event is None:
#         saved_event = SavedEvent(student_id=student_id, event_id=event_id)
#         session.add(saved_event)
#         session.commit()
#         session.refresh(saved_event)
#     return {"message": "Event saved", "student_id": student_id, "event_id": event_id}
#
# @router.delete("/{student_id}/saved-events/{event_id}", response_model=OperationResponse)
# def unsave_event(student_id: int, event_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     saved_event = session.get(SavedEvent, (student_id, event_id))
#     if saved_event is None:
#         raise HTTPException(status_code=404, detail="Saved event not found")
#     session.delete(saved_event)
#     session.commit()
#     return {"message": "Event removed from saved events", "student_id": student_id, "event_id": event_id}
#
# @router.get("/{student_id}/saved-events", response_model=list[SavedEventResponse])
# def get_saved_events(student_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     statement = (
#         select(SavedEvent, Event)
#         .join(SavedEvent, SavedEvent.event_id == Event.event_id)
#         .where(SavedEvent.student_id == student_id)
#         .order_by(SavedEvent.saved_at.desc())
#     )
#     return [
#         {"event_id": event.event_id, "title": event.title, "location": event.location,
#          "start_datetime": event.start_datetime, "saved_at": saved_event.saved_at}
#         for saved_event, event in session.exec(statement).all()
#     ]
#
# @router.post("/{student_id}/rsvps/{event_id}", response_model=RSVPResponse)
# def create_rsvp(student_id: int, event_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     event = _require_event(session, event_id)
#     rsvps = session.exec(select(RSVP).where(RSVP.student_id == student_id, RSVP.event_id == event_id)).all()
#     active_rsvp = next((rsvp for rsvp in rsvps if rsvp.status == "active"), None)
#     if active_rsvp is not None:
#         raise HTTPException(status_code=409, detail="Student already has an active RSVP")
#     active_rsvp_count = session.exec(
#         select(func.count()).select_from(RSVP).where(RSVP.event_id == event_id, RSVP.status == "active")
#     ).one()
#     if event.capacity is not None and active_rsvp_count >= event.capacity:
#         raise HTTPException(status_code=409, detail="Event is full")
#     rsvp = max(rsvps, key=lambda item: item.created_at) if rsvps else None
#     if rsvp is None:
#         rsvp = RSVP(student_id=student_id, event_id=event_id)
#         session.add(rsvp)
#     else:
#         rsvp.status = "active"
#         rsvp.attended = False
#         rsvp.created_at = datetime.now(timezone.utc)
#     session.commit()
#     session.refresh(rsvp)
#     return rsvp
#
# @router.delete("/{student_id}/rsvps/{event_id}", response_model=OperationResponse)
# def cancel_rsvp(student_id: int, event_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     active_rsvp = session.exec(
#         select(RSVP).where(RSVP.student_id == student_id, RSVP.event_id == event_id, RSVP.status == "active")
#     ).first()
#     if active_rsvp is None:
#         raise HTTPException(status_code=404, detail="Active RSVP not found")
#     active_rsvp.status = "cancelled"
#     session.add(active_rsvp)
#     session.commit()
#     return {"message": "RSVP cancelled"}
#
# @router.get("/{student_id}/rsvps", response_model=list[StudentRSVPEventResponse])
# def get_rsvps(student_id: int, session: Session = Depends(get_session)):
#     _require_student(session, student_id)
#     statement = (
#         select(RSVP, Event)
#         .join(Event, Event.event_id == RSVP.event_id)
#         .where(RSVP.student_id == student_id, RSVP.status == "active")
#         .order_by(RSVP.created_at.desc())
#     )
#     return [
#         {"event_id": event.event_id, "title": event.title, "location": event.location,
#          "start_datetime": event.start_datetime}
#         for rsvp, event in session.exec(statement).all()
#     ]
# ============================================================================