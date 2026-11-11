from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import Event, EventView, Student
from app.schemas import EventViewResponse, RecommendationResponse, EventResponseFront
from app.services.recommendations import get_recommendations as calculate_recommendations
from app.schemas import StudentFeedSyncResponse
from typing import Optional
from app.services.student_feed import sync_student_feed, wrap_single_event

router = APIRouter(prefix="/api/students", tags=["Students"])


# ----------------------------------------------------------------------------
# ORIGINAL (kept for reference)
# Returned the EventView row (student_id, event_id, view_count, last_viewed_at).
# view_count is internal (feeds recommendations) and the app had no use for it.
#
# @router.post(
#     "/{student_id}/events/{event_id}/view",
#     response_model=EventViewResponse,
# )
# def record_event_view(...):
#     ...
#     return event_view
# ----------------------------------------------------------------------------


# ----------------------------------------------------------------------------
# NEW: records the view (same as before), then returns the wrapped event.
# Call it when the student opens an event's details: one request both logs the
# view and gives the app the latest version of the event.
# ----------------------------------------------------------------------------
@router.post(
    "/{student_id}/events/{event_id}/view",
    response_model=EventResponseFront,
)
def record_event_view(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")

    event = session.get(Event, event_id)
    if event is None or event.status != "active":
        raise HTTPException(status_code=404, detail="Event not found")

    # 1. Record the view (unchanged)
    event_view = session.get(EventView, (student_id, event_id))
    if event_view is None:
        event_view = EventView(student_id=student_id, event_id=event_id)
    else:
        event_view.view_count += 1
        event_view.last_viewed_at = datetime.now(timezone.utc)

    session.add(event_view)
    session.commit()

    # 2. Return the event in the student-facing shape (view_count stays internal)
    return wrap_single_event(session, event, student_id)


# ----------------------------------------------------------------------------
# REPLACED by the student feed: GET /api/students/{student_id}/feed
#
# The feed now handles recommendations:
#   - ranks events by the student's interest scores (same scoring)
#   - sends `recommended_ids` (ranked) + `is_recommended` on each event
#   - keeps relevance_score on the server (this route sent it to the app)
#   - caps recommendations so "Upcoming" is never empty
# See app/services/student_feed.py
#
# @router.get(
#     "/{student_id}/recommendations",
#     response_model=list[RecommendationResponse],
# )
# def get_recommendations(
#     student_id: int,
#     session: Session = Depends(get_session),
# ):
#     if session.get(Student, student_id) is None:
#         raise HTTPException(status_code=404, detail="Student not found")
#
#     return calculate_recommendations(student_id, session)
# ----------------------------------------------------------------------------

@router.get("/{student_id}/feed", response_model=StudentFeedSyncResponse)
def student_feed(
    student_id: int,
    since: Optional[datetime] = None,          # ?since=2026-11-10T20:14:00Z
    session: Session = Depends(get_session),
):
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")

    return sync_student_feed(session, student_id, since)