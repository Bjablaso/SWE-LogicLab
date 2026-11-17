from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Interest, Student, StudentInterest, User
from app.schemas.account import (
    InterestResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
)

router = APIRouter(prefix="/api/students", tags=["Student Profile"])


@router.get(
    "/interests/all",
    response_model=list[InterestResponse],
)
def get_interests(
    session: Session = Depends(get_session),
) -> list[InterestResponse]:
    interests = session.exec(
        select(Interest).order_by(Interest.interest_name)
    ).all()
    return [
        InterestResponse(
            interest_id=interest.interest_id,
            name=interest.interest_name,
        )
        for interest in interests
        if interest.interest_id is not None
    ]


def get_profile(
    session: Session,
    student_id: int,
) -> StudentProfileResponse:
    student = session.get(Student, student_id)
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    user = session.get(User, student.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )
    if user.email is None or user.display_name is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account profile is incomplete",
        )

    interests = session.exec(
        select(Interest)
        .join(
            StudentInterest,
            StudentInterest.interest_id == Interest.interest_id,
        )
        .where(StudentInterest.student_id == student_id)
        .order_by(Interest.interest_name)
    ).all()

    return StudentProfileResponse(
        student_id=student.user_id,
        user_id=user.user_id,
        email=user.email,
        display_name=user.display_name,
        interests=[
            InterestResponse(
                interest_id=interest.interest_id,
                name=interest.interest_name,
            )
            for interest in interests
            if interest.interest_id is not None
        ],
    )


@router.get(
    "/{student_id}/profile",
    response_model=StudentProfileResponse,
)
def read_student_profile(
    student_id: int,
    session: Session = Depends(get_session),
) -> StudentProfileResponse:
    return get_profile(session, student_id)


@router.put(
    "/{student_id}/profile",
    response_model=StudentProfileResponse,
)
def update_student_profile(
    student_id: int,
    request: StudentProfileUpdate,
    session: Session = Depends(get_session),
) -> StudentProfileResponse:
    student = session.get(Student, student_id)
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    user = session.get(User, student.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    requested_ids = set(request.interest_ids)
    interests = (
        session.exec(
            select(Interest).where(Interest.interest_id.in_(requested_ids))
        ).all()
        if requested_ids
        else []
    )
    found_ids = {interest.interest_id for interest in interests}
    missing_ids = requested_ids - found_ids
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interest IDs not found: {sorted(missing_ids)}",
        )

    current_rows = session.exec(
        select(StudentInterest).where(
            StudentInterest.student_id == student_id
        )
    ).all()
    current_by_interest_id = {
        row.interest_id: row for row in current_rows
    }

    user.display_name = request.display_name
    for interest_id, row in current_by_interest_id.items():
        if interest_id not in requested_ids:
            session.delete(row)

    for interest_id in requested_ids - current_by_interest_id.keys():
        session.add(
            StudentInterest(
                student_id=student_id,
                interest_id=interest_id,
            )
        )

    session.commit()
    return get_profile(session, student_id)
