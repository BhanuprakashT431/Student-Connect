from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# Profile Schemas
class ProfileData(BaseModel):
    title: Optional[str] = ""
    company: Optional[str] = ""
    bio: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    contact_email: Optional[str] = ""


# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    role: str = Field(..., description="Must be 'student' or 'employee'")
    full_name: str = Field(..., min_length=2, description="Name must be at least 2 characters")
    profile_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("student", "employee"):
            raise ValueError("Role must be either 'student' or 'employee'")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: str
    profile_data: Dict[str, Any]

    class Config:
        from_attributes = True


# Opportunity Schemas
class OpportunityCreate(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    type: str = Field(..., description="Must be 'job' or 'internship'")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("job", "internship"):
            raise ValueError("Type must be either 'job' or 'internship'")
        return v

class OpportunityResponse(BaseModel):
    id: int
    title: str
    company: str
    description: str
    type: str
    posted_by: int

    class Config:
        from_attributes = True


# Connection Request Schemas
class ConnectionRequestCreate(BaseModel):
    employee_id: int
    pitch: str = Field(..., max_length=300, description="Pitch must not exceed 300 characters")

    @field_validator("pitch")
    @classmethod
    def validate_pitch(cls, v: str) -> str:
        if len(v) > 300:
            raise ValueError("Connection pitch cannot exceed 300 characters")
        if len(v.strip()) == 0:
            raise ValueError("Connection pitch cannot be empty")
        return v

class ConnectionRequestUpdate(BaseModel):
    status: str = Field(..., description="Must be 'accepted' or 'declined'")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("accepted", "declined"):
            raise ValueError("Status must be either 'accepted' or 'declined'")
        return v

class ConnectionRequestResponse(BaseModel):
    id: int
    student_id: int
    employee_id: int
    status: str
    pitch: str
    created_at: datetime
    student: UserResponse
    employee: UserResponse

    class Config:
        from_attributes = True
