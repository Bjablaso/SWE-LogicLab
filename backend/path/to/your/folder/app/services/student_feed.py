"""
Student feed: ranked events for one student, with cursor-based sync.

- since=None  -> full feed (first load, reinstall)
- since=<ts>  -> only events changed after the cursor, plus full ID lists
Internal fields (organizer_id, category_id, status, scores) never leave this file.
"""
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, or_
from sqlmodel import Session, col, func, select

from app.models import (
    RSVP,
    Category,
    Event,
    EventInterest,
    SavedEvent,
    Student,
    StudentInterest,
)

RECOMMENDED_LIMIT = 5
SYNC_OVERLAP = timedelta(seconds=5)


# ---------------------------------------------------------------- checks

def _require_student(session: Session, student_id: int) -> None:
    if session.get(Student, student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")


def _upcoming_clause(now: datetime):
    """SQL filter: the event hasn't ended."""
    return or_(
        Event.end_datetime >= now,
        and_(Event.end_datetime.is_(None), Event.start_datetime >= now),
    )


# ---------------------------------------------------------------- lookups (one query each)

def _category_names(session: Session) -> dict[int, str]:
    return {c.category_id: c.category_name for c in session.exec(select(Category)).all()}


def _saved_ids(session: Session, student_id: int) -> set[int]:
    return set(session.exec(
        select(SavedEvent.event_id).where(SavedEvent.student_id == student_id)
    ).all())


def _rsvp_ids(session: Session, student_id: int) -> set[int]:
    return set(session.exec(
        select(RSVP.event_id).where(RSVP.student_id == student_id, RSVP.status == "active")
    ).all())


def _active_rsvp_counts(session: Session, event_ids: list[int]) -> dict[int, int]:
    if not event_ids:
        return {}
    rows = session.exec(
        select(RSVP.event_id, func.count())
        .where(col(RSVP.event_id).in_(event_ids), RSVP.status == "active")
        .group_by(RSVP.event_id)
    ).all()
    return {event_id: count for event_id, count in rows}


# ---------------------------------------------------------------- ranking

def _relevance_scores(session: Session, student_id: int, event_ids: list[int]) -> dict[int, float]:
    """Average of the student's scores for each event's matching interests."""
    if not event_ids:
        return {}

    student_scores = {
        si.interest_id: si.score
        for si in session.exec(
            select(StudentInterest).where(StudentInterest.student_id == student_id)
        ).all()
    }

    tags = session.exec(
        select(EventInterest).where(col(EventInterest.event_id).in_(event_ids))
    ).all()

    matched: dict[int, list[float]] = defaultdict(list)
    for tag in tags:
        if tag.interest_id in student_scores:
            matched[tag.event_id].append(student_scores[tag.interest_id])

    return {event_id: sum(s) / len(s) for event_id, s in matched.items()}


def _recommended_ids(events: list[Event], scores: dict[int, float]) -> list[int]:
    """Top N events with a score above 0, best first."""
    ranked = sorted(
        (e for e in events if scores.get(e.event_id, 0) > 0),
        key=lambda e: scores[e.event_id],
        reverse=True,
    )
    return [e.event_id for e in ranked[:RECOMMENDED_LIMIT]]


def _date_group(start: datetime, now: datetime) -> int:
    """0 = today, 1 = within 7 days, 2 = later."""
    if start.date() <= now.date():
        return 0
    if start <= now + timedelta(days=7):
        return 1
    return 2


def _feed_order(events: list[Event], scores: dict[int, float], now: datetime) -> list[Event]:
    """Date group → higher score first → earlier start."""
    return sorted(
        events,
        key=lambda e: (
            _date_group(e.start_datetime, now),
            -scores.get(e.event_id, 0),
            e.start_datetime,
        ),
    )


# ---------------------------------------------------------------- wrapper

def _to_feed_event(
    event: Event,
    categories: dict[int, str],
    rsvp_counts: dict[int, int],
    saved: set[int],
    rsvpd: set[int],
    recommended: Optional[set[int]] = None,     # None = not ranked (search)
) -> dict:
    is_rsvpd = event.event_id in rsvpd
    spots_left = (
        None if event.capacity is None
        else max(event.capacity - rsvp_counts.get(event.event_id, 0), 0)
    )
    return {
        "event_id": event.event_id,
        "title": event.title,
        "description": event.description,
        "category": categories.get(event.category_id, "Other"),
        "start_datetime": event.start_datetime,
        "end_datetime": event.end_datetime,
        "location": event.location,
        "capacity": event.capacity,
        "spots_left": spots_left,
        "is_saved": event.event_id in saved and not is_rsvpd,   # RSVP wins
        "is_rsvpd": is_rsvpd,
        "is_recommended": event.event_id in recommended,
    }


# ---------------------------------------------------------------- public

def sync_student_feed(
    session: Session,
    student_id: int,
    since: Optional[datetime] = None,
) -> dict:
    _require_student(session, student_id)

    # Cursor is taken BEFORE reading, so changes made during this request
    # are picked up by the next sync.
    sync_token = datetime.now(timezone.utc)

    # All live events. Needed every time to rank and order the full feed,
    # even when only a few of them are sent back.
    upcoming = session.exec(
        select(Event).where(Event.status == "active", _upcoming_clause(sync_token))
    ).all()

    scores = _relevance_scores(session, student_id, [e.event_id for e in upcoming])
    recommended_ids = _recommended_ids(upcoming, scores)
    ordered = _feed_order(upcoming, scores, sync_token)

    if since is None:
        # Full sync: send every event
        full_sync = True
        to_send = ordered
        removed_ids: list[int] = []
    else:
        # Delta: send only what changed after the cursor (minus the overlap)
        full_sync = False
        cutoff = since - SYNC_OVERLAP
        to_send = [e for e in ordered if e.updated_at > cutoff]
        removed_ids = list(session.exec(
            select(Event.event_id).where(
                Event.status != "active",
                Event.updated_at > cutoff,
            )
        ).all())

    categories = _category_names(session)
    rsvp_counts = _active_rsvp_counts(session, [e.event_id for e in to_send])
    saved = _saved_ids(session, student_id)
    rsvpd = _rsvp_ids(session, student_id)
    recommended = set(recommended_ids)

    return {
        "events": [
            _to_feed_event(e, categories, rsvp_counts, saved, rsvpd, recommended)
            for e in to_send
        ],
        "removed_ids": removed_ids,
        "order_ids": [e.event_id for e in ordered],
        "recommended_ids": recommended_ids,
        "saved_ids": sorted(saved),
        "rsvp_ids": sorted(rsvpd),
        "sync_token": sync_token,
        "full_sync": full_sync,
    }