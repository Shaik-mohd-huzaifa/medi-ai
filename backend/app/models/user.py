from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User role types"""
    PATIENT = "patient"
    CAREGIVER = "caregiver"
    ADMIN = "admin"


class CaregiverType(str, enum.Enum):
    """Types of caregivers"""
    INDIVIDUAL_DOCTOR = "individual_doctor"
    CLINIC = "clinic"
    HOSPITAL = "hospital"


class CompanyType(str, enum.Enum):
    """Company structure types"""
    LLC_PARTNERSHIP = "llc_partnership"
    C_S_CORPORATION = "c_s_corporation"
    B_CORPORATION = "b_corporation"


class EmployeeCount(str, enum.Enum):
    """Number of employees"""
    SMALL = "1-10"
    MEDIUM = "21-49"
    LARGE = "50+"


class User(Base):
    """Base user model for all users"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    caregiver_profile = relationship("CaregiverProfile", back_populates="user", uselist=False)


class PatientProfile(Base):
    """Extended profile for patients"""
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Personal Information
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)
    
    # Address Information
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zipcode = Column(String, nullable=True)
    country = Column(String, default="USA")
    
    # Emergency Contact
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    emergency_contact_relationship = Column(String, nullable=True)
    
    # Insurance Information
    insurance_provider = Column(String, nullable=True)
    insurance_policy_number = Column(String, nullable=True)
    
    # Medical History
    allergies = Column(String, nullable=True)  # JSON string
    current_medications = Column(String, nullable=True)  # JSON string
    medical_conditions = Column(String, nullable=True)  # JSON string
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_profile")


class CaregiverProfile(Base):
    """Extended profile for caregivers (doctors, clinics, hospitals)"""
    __tablename__ = "caregiver_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Business Information
    caregiver_type = Column(Enum(CaregiverType), nullable=False)
    business_name = Column(String, nullable=False)
    business_description = Column(String, nullable=True)
    company_type = Column(Enum(CompanyType), nullable=True)
    employee_count = Column(Enum(EmployeeCount), nullable=True)
    
    # Professional Information
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)  # Comma-separated specializations
    consultation_modes = Column(String, nullable=True)  # Comma-separated: chat, video, in-person
    years_of_experience = Column(Integer, nullable=True)
    rating = Column(Integer, default=5)  # 1-5 rating
    total_consultations = Column(Integer, default=0)
    
    # Business Address
    business_address_line1 = Column(String, nullable=True)
    business_address_line2 = Column(String, nullable=True)
    business_city = Column(String, nullable=True)
    business_state = Column(String, nullable=True)
    business_zipcode = Column(String, nullable=True)
    business_country = Column(String, default="USA")
    
    # Billing Address
    billing_same_as_business = Column(Boolean, default=True)
    billing_address_line1 = Column(String, nullable=True)
    billing_address_line2 = Column(String, nullable=True)
    billing_city = Column(String, nullable=True)
    billing_state = Column(String, nullable=True)
    billing_zipcode = Column(String, nullable=True)
    billing_country = Column(String, default="USA")
    
    # Banking Information
    bank_name = Column(String, nullable=True)
    account_holder_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    routing_number = Column(String, nullable=True)
    
    # Tax Information
    tax_id = Column(String, nullable=True)  # EIN or SSN
    tax_classification = Column(String, nullable=True)
    
    # Verification Status
    is_verified = Column(Boolean, default=False)
    verification_documents = Column(String, nullable=True)  # JSON string
    
    # Profile Completion
    profile_completed = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="caregiver_profile")
