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
    full_name: str
    phone_number: Optional[str] = None
    caregiver_type: CaregiverType


# Caregiver Business Overview (Step 2)
class CaregiverBusinessOverview(BaseModel):
    business_name: str
    business_description: Optional[str] = None
    company_type: Optional[CompanyType] = None
    employee_count: Optional[EmployeeCount] = None
    business_address_line1: Optional[str] = None
    business_address_line2: Optional[str] = None
    business_city: Optional[str] = None
    business_state: Optional[str] = None
    business_zipcode: Optional[str] = None
    billing_same_as_business: bool = True
    billing_address_line1: Optional[str] = None
    billing_address_line2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_zipcode: Optional[str] = None


# Caregiver Profile (Step 3)
class CaregiverProfileBuild(BaseModel):
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None


# Caregiver Banking (Step 4)
class CaregiverBanking(BaseModel):
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None


# Caregiver Tax Information (Step 5)
class CaregiverTax(BaseModel):
    tax_id: Optional[str] = None
    tax_classification: Optional[str] = None


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
