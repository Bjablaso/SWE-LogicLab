from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Event
from app.schemas import EventResponse
from app.services.recommendations import get_recommendations

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("", response_model=list[EventResponse])
def get_events(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    statement = select(Event).where(Event.status == "active")

    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(
            Event.title.ilike(search_pattern)
            | Event.description.ilike(search_pattern)
        )

    if category_id is not None:
        statement = statement.where(Event.category_id == category_id)

    return session.exec(statement).all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
