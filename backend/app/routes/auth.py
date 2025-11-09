from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, PatientProfile, CaregiverProfile, UserRole
from app.schemas.auth import (
    UserLogin, Token, PatientSignup, CaregiverSignupStep1,
    CaregiverBusinessOverview, CaregiverProfileBuild, CaregiverBanking,
    CaregiverTax, UserResponse
)
from app.utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_active_user
)

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/patient/signup", response_model=Token)
async def patient_signup(user_data: PatientSignup, db: Session = Depends(get_db)):
    """Register a new patient"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=UserRole.PATIENT
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create patient profile
    patient_profile = PatientProfile(
        user_id=new_user.id,
        date_of_birth=user_data.date_of_birth
    )
    
    db.add(patient_profile)
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/caregiver/signup/step1", response_model=Token)
async def caregiver_signup_step1(
    user_data: CaregiverSignupStep1,
    db: Session = Depends(get_db)
):
    """Register a new caregiver - Step 1: Create Account"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=UserRole.CAREGIVER
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create caregiver profile
    caregiver_profile = CaregiverProfile(
        user_id=new_user.id,
        caregiver_type=user_data.caregiver_type,
        business_name="",  # Will be filled in step 2
        onboarding_step=1
    )
    
    db.add(caregiver_profile)
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.put("/caregiver/onboarding/step2")
async def caregiver_step2_business_overview(
    data: CaregiverBusinessOverview,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 2: Business Overview"""
    if current_user.role != UserRole.CAREGIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this endpoint"
        )
    
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Update business information
    profile.business_name = data.business_name
    profile.business_description = data.business_description
    profile.company_type = data.company_type
    profile.employee_count = data.employee_count
    profile.business_address_line1 = data.business_address_line1
    profile.business_address_line2 = data.business_address_line2
    profile.business_city = data.business_city
    profile.business_state = data.business_state
    profile.business_zipcode = data.business_zipcode
    profile.billing_same_as_business = data.billing_same_as_business
    
    if not data.billing_same_as_business:
        profile.billing_address_line1 = data.billing_address_line1
        profile.billing_address_line2 = data.billing_address_line2
        profile.billing_city = data.billing_city
        profile.billing_state = data.billing_state
        profile.billing_zipcode = data.billing_zipcode
    
    profile.onboarding_step = 2
    
    db.commit()
    
    return {"message": "Business overview updated successfully", "next_step": 3}


@router.put("/caregiver/onboarding/step3")
async def caregiver_step3_build_profile(
    data: CaregiverProfileBuild,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 3: Build Profile"""
    if current_user.role != UserRole.CAREGIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this endpoint"
        )
    
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Update profile information
    profile.license_number = data.license_number
    profile.specialization = data.specialization
    profile.years_of_experience = data.years_of_experience
    profile.onboarding_step = 3
    
    db.commit()
    
    return {"message": "Profile updated successfully", "next_step": 4}


@router.put("/caregiver/onboarding/step4")
async def caregiver_step4_banking(
    data: CaregiverBanking,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 4: Banking Information"""
    if current_user.role != UserRole.CAREGIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this endpoint"
        )
    
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Update banking information
    profile.bank_name = data.bank_name
    profile.account_holder_name = data.account_holder_name
    profile.account_number = data.account_number
    profile.routing_number = data.routing_number
    profile.onboarding_step = 4
    
    db.commit()
    
    return {"message": "Banking information updated successfully", "next_step": 5}


@router.put("/caregiver/onboarding/step5")
async def caregiver_step5_tax(
    data: CaregiverTax,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 5: Tax Information"""
    if current_user.role != UserRole.CAREGIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this endpoint"
        )
    
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Update tax information
    profile.tax_id = data.tax_id
    profile.tax_classification = data.tax_classification
    profile.onboarding_step = 5
    
    db.commit()
    
    return {"message": "Tax information updated successfully", "next_step": 6}


@router.put("/caregiver/onboarding/complete")
async def caregiver_complete_onboarding(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Complete caregiver onboarding"""
    if current_user.role != UserRole.CAREGIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access this endpoint"
        )
    
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Mark onboarding as complete
    profile.profile_completed = True
    profile.onboarding_step = 7
    
    db.commit()
    
    return {"message": "Onboarding completed successfully!"}


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint for all users"""
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user
