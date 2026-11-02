from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Event, RSVP, SavedEvent, Student
from app.schemas import (
    OperationResponse,
    RSVPResponse,
    SavedEventResponse,
    StudentRSVPEventResponse,
)

router = APIRouter(prefix="/api/students", tags=["Student Engagement"])


def _require_student(session: Session, student_id: int) -> None:
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")


def _require_event(session: Session, event_id: int) -> Event:
    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post(
    "/{student_id}/saved-events/{event_id}",
    response_model=OperationResponse,
)
def save_event(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    _require_event(session, event_id)

    saved_event = session.get(SavedEvent, (student_id, event_id))
    if saved_event is None:
        saved_event = SavedEvent(student_id=student_id, event_id=event_id)
        session.add(saved_event)
        session.commit()
        session.refresh(saved_event)

    return {"message": "Event saved", "student_id": student_id, "event_id": event_id}


@router.delete(
    "/{student_id}/saved-events/{event_id}",
    response_model=OperationResponse,
)
def unsave_event(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    saved_event = session.get(SavedEvent, (student_id, event_id))
    if saved_event is None:
        raise HTTPException(status_code=404, detail="Saved event not found")

    session.delete(saved_event)
    session.commit()
    return {
        "message": "Event removed from saved events",
        "student_id": student_id,
        "event_id": event_id,
    }


@router.get(
    "/{student_id}/saved-events",
    response_model=list[SavedEventResponse],
)
def get_saved_events(
    student_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    statement = (
        select(SavedEvent, Event)
        .join(SavedEvent, SavedEvent.event_id == Event.event_id)
        .where(SavedEvent.student_id == student_id)
        .order_by(SavedEvent.saved_at.desc())
    )
    return [
        {
            "event_id": event.event_id,
            "title": event.title,
            "location": event.location,
            "start_datetime": event.start_datetime,
            "saved_at": saved_event.saved_at,
        }
        for saved_event, event in session.exec(statement).all()
    ]


@router.post("/{student_id}/rsvps/{event_id}", response_model=RSVPResponse)
def create_rsvp(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    event = _require_event(session, event_id)

    rsvps = session.exec(
        select(RSVP).where(RSVP.student_id == student_id, RSVP.event_id == event_id)
    ).all()
    active_rsvp = next((rsvp for rsvp in rsvps if rsvp.status == "active"), None)
    if active_rsvp is not None:
        raise HTTPException(
            status_code=409,
            detail="Student already has an active RSVP",
        )

    active_rsvp_count = session.exec(
        select(func.count())
        .select_from(RSVP)
        .where(RSVP.event_id == event_id, RSVP.status == "active")
    ).one()
    if event.capacity is not None and active_rsvp_count >= event.capacity:
        raise HTTPException(status_code=409, detail="Event is full")

    rsvp = max(rsvps, key=lambda item: item.created_at) if rsvps else None
    if rsvp is None:
        rsvp = RSVP(student_id=student_id, event_id=event_id)
        session.add(rsvp)
    else:
        rsvp.status = "active"
        rsvp.attended = False
        rsvp.created_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(rsvp)

    return rsvp


@router.delete(
    "/{student_id}/rsvps/{event_id}",
    response_model=OperationResponse,
)
def cancel_rsvp(
    student_id: int,
    event_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    active_rsvp = session.exec(
        select(RSVP).where(
            RSVP.student_id == student_id,
            RSVP.event_id == event_id,
            RSVP.status == "active",
        )
    ).first()
    if active_rsvp is None:
        raise HTTPException(status_code=404, detail="Active RSVP not found")

    active_rsvp.status = "cancelled"
    session.add(active_rsvp)
    session.commit()
    return {"message": "RSVP cancelled"}


@router.get(
    "/{student_id}/rsvps",
    response_model=list[StudentRSVPEventResponse],
)
def get_rsvps(
    student_id: int,
    session: Session = Depends(get_session),
):
    _require_student(session, student_id)
    statement = (
        select(RSVP, Event)
        .join(Event, Event.event_id == RSVP.event_id)
        .where(RSVP.student_id == student_id, RSVP.status == "active")
        .order_by(RSVP.created_at.desc())
    )
    return [
        {
            "event_id": event.event_id,
            "title": event.title,
            "location": event.location,
            "start_datetime": event.start_datetime,
        }
        for rsvp, event in session.exec(statement).all()
    ]
