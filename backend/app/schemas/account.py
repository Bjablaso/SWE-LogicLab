from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    user_id: int
    student_id: int
    email: str
    display_name: str
    role: str
    message: str


class LogoutResponse(BaseModel):
    message: str


class InterestResponse(BaseModel):
    interest_id: int
    name: str


class StudentProfileResponse(BaseModel):
    student_id: int
    user_id: int
    email: str
    display_name: str
    university: str = "Towson University"
    interests: list[InterestResponse]


class StudentProfileUpdate(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    interest_ids: list[int]
