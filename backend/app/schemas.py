from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EventResponseFront(BaseModel):
    event_id: int
    title: str
    description: str
    category: str                    # name, not ID
    start_datetime: datetime
    end_datetime: Optional[datetime]
    location: Optional[str]
    capacity: Optional[int]
    spots_left: Optional[int]        # None = no capacity limit
    is_saved: bool
    is_rsvpd: bool
    is_recommended: Optional[bool] = None

class StudentFeedSyncResponse(BaseModel):
    events: list[EventResponseFront]   # full sync: everything; delta: only changed
    removed_ids: list[int]           # cancelled since the cursor
    order_ids: list[int]             # full feed order: date group → score → start
    recommended_ids: list[int]       # ranked best-first
    saved_ids: list[int]
    rsvp_ids: list[int]
    sync_token: datetime             # cursor: send back as ?since=
    full_sync: bool                  # True = replace the whole cache

#For search Update
class EventSearchResponse(BaseModel):
    events: list[EventResponseFront]   # matching events, earliest first
    searched_at: datetime              # when the results were built (NOT a sync cursor)

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
