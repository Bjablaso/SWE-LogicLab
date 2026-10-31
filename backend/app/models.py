from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    user_id: Optional[int] = Field(default=None, primary_key=True)


class Student(SQLModel, table=True):
    __tablename__ = "students"

    user_id: int = Field(foreign_key="users.user_id", primary_key=True)


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    category_id: Optional[int] = Field(default=None, primary_key=True)
    category_name: str = Field(unique=True)


class Interest(SQLModel, table=True):
    __tablename__ = "interests"

    interest_id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="categories.category_id")
    interest_name: str = Field(unique=True)


class StudentInterest(SQLModel, table=True):
    __tablename__ = "student_interests"

    student_id: int = Field(foreign_key="students.user_id", primary_key=True)
    interest_id: int = Field(foreign_key="interests.interest_id", primary_key=True)
    score: float = Field(default=0)


class Event(SQLModel, table=True):
    __tablename__ = "events"

    event_id: Optional[int] = Field(default=None, primary_key=True)
    organizer_id: Optional[int] = Field(default=None, foreign_key="users.user_id")
    category_id: int = Field(foreign_key="categories.category_id")
    title: str
    description: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    status: str = "active"


class EventInterest(SQLModel, table=True):
    __tablename__ = "event_interests"

    event_id: int = Field(foreign_key="events.event_id", primary_key=True)
    interest_id: int = Field(foreign_key="interests.interest_id", primary_key=True)


class SearchHistory(SQLModel, table=True):
    __tablename__ = "searches"

    search_id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="students.user_id")
    keyword: Optional[str] = None
    searched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EventView(SQLModel, table=True):
    __tablename__ = "event_views"

    student_id: int = Field(foreign_key="students.user_id", primary_key=True)
    event_id: int = Field(foreign_key="events.event_id", primary_key=True)
    view_count: int = 1
    last_viewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Recommendation(SQLModel, table=True):
    __tablename__ = "recommendations"

    student_id: int = Field(foreign_key="students.user_id", primary_key=True)
    event_id: int = Field(foreign_key="events.event_id", primary_key=True)
    relevance_score: float
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SavedEvent(SQLModel, table=True):
    __tablename__ = "saved_events"

    student_id: int = Field(foreign_key="students.user_id", primary_key=True)
    event_id: int = Field(foreign_key="events.event_id", primary_key=True)
    saved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RSVP(SQLModel, table=True):
    __tablename__ = "rsvps"

    rsvp_id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="students.user_id")
    event_id: int = Field(foreign_key="events.event_id")
    status: str = "active"
    attended: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
