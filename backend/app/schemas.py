from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: int
    organizer_id: Optional[int]
    category_id: int
    title: str
    description: str
    start_datetime: datetime
    end_datetime: Optional[datetime]
    location: Optional[str]
    capacity: Optional[int]
    status: str


class RecommendationResponse(BaseModel):
    event_id: int
    title: str
    description: str
    location: Optional[str]
    start_datetime: datetime
    relevance_score: float


class EventViewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    event_id: int
    view_count: int
    last_viewed_at: datetime


class SavedEventResponse(BaseModel):
    event_id: int
    title: str
    location: Optional[str]
    start_datetime: datetime
    saved_at: datetime


class RSVPResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rsvp_id: int
    student_id: int
    event_id: int
    status: str
    attended: bool
    created_at: datetime


class StudentRSVPEventResponse(BaseModel):
    event_id: int
    title: str
    location: Optional[str]
    start_datetime: datetime


class OperationResponse(BaseModel):
    message: str
    student_id: Optional[int] = None
    event_id: Optional[int] = None
