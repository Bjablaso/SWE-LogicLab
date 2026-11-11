from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import Event, EventView, Student
from app.schemas import EventViewResponse, RecommendationResponse
from app.services.recommendations import get_recommendations as calculate_recommendations
from app.schemas import StudentFeedSyncResponse
from typing import Optional
from app.services.student_feed import sync_student_feed

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.post(
    "/{student_id}/events/{event_id}/view",
    response_model=EventViewResponse,
)
def record_event_view(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")
    if session.get(Event, event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")

    event_view = session.get(EventView, (student_id, event_id))
    if event_view is None:
        event_view = EventView(student_id=student_id, event_id=event_id)
    else:
        event_view.view_count += 1
        event_view.last_viewed_at = datetime.now(timezone.utc)

    session.add(event_view)
    session.commit()
    session.refresh(event_view)
    return event_view


@router.get(
    "/{student_id}/recommendations",
    response_model=list[RecommendationResponse],
)
def get_recommendations(
    student_id: int,
    session: Session = Depends(get_session),
):
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")

    return calculate_recommendations(student_id, session)

@router.get("/{student_id}/feed", response_model=StudentFeedSyncResponse)
def student_feed(
    student_id: int,
    since: Optional[datetime] = None,          # ?since=2026-11-10T20:14:00Z
    session: Session = Depends(get_session),
):
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")

    return sync_student_feed(session, student_id, since)