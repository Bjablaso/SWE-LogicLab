"""Event search: title/description, category, location, and date window.

One-off query. It does not move the sync cursor. The app can merge the
results into its cache by event_id, and later changes arrive through the
normal feed sync.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from app.models import Category, Event, SearchHistory
from app.services.student_feed import (
    _active_rsvp_counts,
    _category_names,
    _require_student,
    _rsvp_ids,
    _saved_ids,
    _to_feed_event,
    _upcoming_clause,
)


def search_events(
    session: Session,
    student_id: int,
    q: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    start_after: Optional[datetime] = None,
    start_before: Optional[datetime] = None,
) -> dict:
    _require_student(session, student_id)
    searched_at = datetime.now(timezone.utc)

    # Only events that haven't ended, same rule as the feed
    statement = select(Event).where(
        Event.status == "active",
        _upcoming_clause(searched_at),
    )

    # Title or description
    if q:
        pattern = f"%{q.strip()}%"
        statement = statement.where(
            Event.title.ilike(pattern) | Event.description.ilike(pattern)
        )

    # Category by name
    if category:
        statement = statement.join(
            Category, Category.category_id == Event.category_id
        ).where(Category.category_name.ilike(category.strip()))

    # Location
    if location:
        statement = statement.where(Event.location.ilike(f"%{location.strip()}%"))

    # Date window
    if start_after is not None:
        statement = statement.where(Event.start_datetime >= start_after)
    if start_before is not None:
        statement = statement.where(Event.start_datetime < start_before)

    results = session.exec(statement.order_by(Event.start_datetime)).all()

    # REQ-3: store the student's search history
    if q:
        session.add(SearchHistory(student_id=student_id, keyword=q.strip()))
        session.commit()

    # Wrap into EventResponseFront (no ranking, so is_recommended = None)
    categories = _category_names(session)
    rsvp_counts = _active_rsvp_counts(session, [e.event_id for e in results])
    saved = _saved_ids(session, student_id)
    rsvpd = _rsvp_ids(session, student_id)

    return {
        "events": [
            _to_feed_event(e, categories, rsvp_counts, saved, rsvpd)
            for e in results
        ],
        "searched_at": searched_at,
    }