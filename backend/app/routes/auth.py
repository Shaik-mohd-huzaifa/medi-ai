from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, PatientProfile, CaregiverProfile, UserRole
from app.schemas.auth import (
    UserLogin, Token, PatientSignup, CaregiverSignupStep1,
    CaregiverLocation, CaregiverServices, UserResponse
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
        business_name=user_data.full_name,  # Clinic/Hospital name or doctor name
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
async def caregiver_step2_location(
    data: CaregiverLocation,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 2: Location"""
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
    
    # Update location information
    profile.business_address_line1 = data.address_line1
    profile.business_address_line2 = data.address_line2
    profile.business_city = data.city
    profile.business_state = data.state
    profile.business_zipcode = data.zipcode
    profile.onboarding_step = 2
    
    db.commit()
    
    return {"message": "Location updated successfully", "next_step": 3}


@router.put("/caregiver/onboarding/step3")
async def caregiver_step3_services(
    data: CaregiverServices,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update caregiver profile - Step 3: Services Offered"""
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
    
    # Update services information
    profile.specialization = ", ".join(data.specializations)
    profile.onboarding_step = 3
    profile.onboarding_completed = True
    
    db.commit()
    
    return {"message": "Services updated successfully. Onboarding complete!"}


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
