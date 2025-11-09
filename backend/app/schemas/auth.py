from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, CaregiverType, CompanyType, EmployeeCount


# Base User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    two_factor_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Patient Signup
class PatientSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None


# Caregiver Signup (Step 1)
class CaregiverSignupStep1(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str  # User name or Clinic/Hospital name based on type
    phone_number: Optional[str] = None
    caregiver_type: CaregiverType


# Caregiver Location (Step 2)
class CaregiverLocation(BaseModel):
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: str = "United States"
    zipcode: Optional[str] = None


# Caregiver Services (Step 3)
class CaregiverServices(BaseModel):
    specializations: list[str]  # e.g., ["General", "Cardiology", "Pediatrics"]
    consultation_modes: list[str]  # e.g., ["In-person", "Telemedicine", "Home visits"]


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
