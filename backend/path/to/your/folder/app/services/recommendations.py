from sqlmodel import Session, select

from app.models import Event, EventInterest, StudentInterest


def get_recommendations(student_id: int, session: Session):
    events = session.exec(
        select(Event).where(Event.status == "active")
    ).all()

    results = []
    for event in events:
        event_interest_rows = session.exec(
            select(EventInterest).where(EventInterest.event_id == event.event_id)
        ).all()
        scores = []
        for event_interest in event_interest_rows:
            student_interest = session.get(
                StudentInterest,
                (student_id, event_interest.interest_id),
            )
            if student_interest is not None:
                scores.append(student_interest.score)

        relevance_score = sum(scores) / len(scores) if scores else 0
        results.append(
            {
                "event_id": event.event_id,
                "title": event.title,
                "description": event.description,
                "location": event.location,
                "start_datetime": event.start_datetime,
                "relevance_score": round(relevance_score, 2),
            }
        )

    return sorted(
        results,
        key=lambda recommendation: (
            -recommendation["relevance_score"],
            recommendation["event_id"],
        ),
    )
