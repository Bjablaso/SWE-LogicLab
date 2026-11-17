from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.database import get_session
from app.models import Student, User
from app.schemas.account import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RegisterRequest,
)
from app.security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    session: Session = Depends(get_session),
) -> LoginResponse:
    existing_user = session.exec(
        select(User).where(User.email == request.email)
    ).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    user = User(
        email=str(request.email),
        display_name=request.display_name,
        password_hash=hash_password(request.password),
        role="student",
    )
    try:
        session.add(user)
        session.flush()
        if user.user_id is None:
            raise RuntimeError("Database did not assign a user ID")

        student = Student(user_id=user.user_id)
        session.add(student)
        session.commit()
        session.refresh(user)
    except IntegrityError as error:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        ) from error

    if (
        user.user_id is None
        or user.email is None
        or user.display_name is None
    ):
        raise RuntimeError("Created account is missing required profile fields")

    return LoginResponse(
        user_id=user.user_id,
        student_id=student.user_id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        message="Account created successfully",
    )


@router.post("/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    session: Session = Depends(get_session),
) -> LoginResponse:
    user = session.exec(
        select(User).where(User.email == request.email)
    ).first()
    if (
        user is None
        or user.password_hash is None
        or not verify_password(request.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    student = session.exec(
        select(Student).where(Student.user_id == user.user_id)
    ).first()
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    if (
        user.user_id is None
        or user.email is None
        or user.display_name is None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account profile is incomplete",
        )

    return LoginResponse(
        user_id=user.user_id,
        student_id=student.user_id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
        message="Login successful",
    )


@router.post("/logout", response_model=LogoutResponse)
def logout() -> LogoutResponse:
    return LogoutResponse(message="Logged out successfully")
