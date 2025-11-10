from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, CaregiverProfile, UserRole, CaregiverType

router = APIRouter(prefix="/api/v1/caregivers", tags=["caregivers"])


class CaregiverResponse(BaseModel):
    id: int
    full_name: str
    business_name: str
    caregiver_type: str
    specialization: Optional[str]
    consultation_modes: Optional[str]
    years_of_experience: Optional[int]
    rating: int
    total_consultations: int
    business_city: Optional[str]
    business_state: Optional[str]
    business_country: Optional[str]
    match_score: float

    class Config:
        from_attributes = True


class CaregiverMatchRequest(BaseModel):
    """Request for matching caregivers based on patient needs"""
    symptoms: Optional[str] = None
    urgency: Optional[str] = None  # low, medium, high, urgent
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    consultation_mode: Optional[str] = None  # chat, video, in-person
    specialization: Optional[str] = None
    limit: int = 3


async def match_caregivers_logic(request: CaregiverMatchRequest, db: Session) -> List[dict]:
    """
    Core logic for matching caregivers. Can be called from API or other services.
    Match caregivers based on patient needs, location, symptoms, and other criteria.
    Returns top matching caregivers sorted by match score.
    """
    # Base query for caregivers
    query = db.query(User, CaregiverProfile).join(
        CaregiverProfile, User.id == CaregiverProfile.user_id
    ).filter(
        User.role == UserRole.CAREGIVER,
        User.is_active == True,
        CaregiverProfile.is_verified == True
    )

    # Filter by location if provided
    if request.city:
        query = query.filter(CaregiverProfile.business_city.ilike(f"%{request.city}%"))
    if request.state:
        query = query.filter(CaregiverProfile.business_state.ilike(f"%{request.state}%"))
    if request.country:
        query = query.filter(CaregiverProfile.business_country.ilike(f"%{request.country}%"))

    # Filter by consultation mode if provided
    if request.consultation_mode:
        query = query.filter(CaregiverProfile.consultation_modes.ilike(f"%{request.consultation_mode}%"))

    # Filter by specialization if provided
    if request.specialization:
        query = query.filter(CaregiverProfile.specialization.ilike(f"%{request.specialization}%"))

    caregivers = query.all()

    # Calculate match scores for each caregiver
    matched_caregivers = []
    for user, profile in caregivers:
        match_score = calculate_match_score(
            profile=profile,
            symptoms=request.symptoms,
            urgency=request.urgency,
            city=request.city,
            state=request.state,
            consultation_mode=request.consultation_mode,
            specialization=request.specialization
        )

        matched_caregivers.append({
            "id": user.id,
            "full_name": user.full_name,
            "business_name": profile.business_name,
            "caregiver_type": profile.caregiver_type.value,
            "specialization": profile.specialization,
            "consultation_modes": profile.consultation_modes,
            "years_of_experience": profile.years_of_experience,
            "rating": profile.rating,
            "total_consultations": profile.total_consultations,
            "business_city": profile.business_city,
            "business_state": profile.business_state,
            "business_country": profile.business_country,
            "match_score": match_score
        })

    # Sort by match score (descending) and rating
    matched_caregivers.sort(key=lambda x: (x["match_score"], x["rating"], x["total_consultations"]), reverse=True)

    # Return top N caregivers
    return matched_caregivers[:request.limit]


@router.post("/match", response_model=List[CaregiverResponse])
async def match_caregivers(request: CaregiverMatchRequest, db: Session = Depends(get_db)):
    """
    API endpoint to match caregivers based on patient needs.
    """
    return await match_caregivers_logic(request, db)


def calculate_match_score(
    profile: CaregiverProfile,
    symptoms: Optional[str],
    urgency: Optional[str],
    city: Optional[str],
    state: Optional[str],
    consultation_mode: Optional[str],
    specialization: Optional[str]
) -> float:
    """
    Calculate match score based on various criteria.
    Score range: 0.0 to 100.0
    """
    score = 50.0  # Base score

    # Location match (20 points)
    if city and profile.business_city:
        if profile.business_city.lower() == city.lower():
            score += 15.0
        elif city.lower() in profile.business_city.lower():
            score += 10.0

    if state and profile.business_state:
        if profile.business_state.lower() == state.lower():
            score += 5.0

    # Consultation mode match (15 points)
    if consultation_mode and profile.consultation_modes:
        if consultation_mode.lower() in profile.consultation_modes.lower():
            score += 15.0

    # Specialization match (20 points)
    if specialization and profile.specialization:
        if specialization.lower() in profile.specialization.lower():
            score += 20.0

    # Symptom-based specialization matching (15 points)
    if symptoms and profile.specialization:
        symptom_keywords = {
            'heart': ['Cardiology', 'Internal Medicine'],
            'chest pain': ['Cardiology', 'Emergency Medicine'],
            'breathing': ['Pulmonology', 'Cardiology'],
            'cough': ['Pulmonology', 'General Medicine'],
            'fever': ['Internal Medicine', 'General Medicine', 'Infectious Disease'],
            'headache': ['Neurology', 'General Medicine'],
            'stomach': ['Gastroenterology', 'General Medicine'],
            'skin': ['Dermatology'],
            'bone': ['Orthopedics'],
            'mental': ['Psychiatry', 'Psychology'],
            'anxiety': ['Psychiatry', 'Psychology'],
            'depression': ['Psychiatry', 'Psychology'],
            'pregnancy': ['Obstetrics', 'Gynecology'],
            'child': ['Pediatrics'],
            'eye': ['Ophthalmology'],
            'ear': ['ENT', 'Otolaryngology'],
        }

        symptoms_lower = symptoms.lower()
        for keyword, specializations in symptom_keywords.items():
            if keyword in symptoms_lower:
                for spec in specializations:
                    if spec.lower() in profile.specialization.lower():
                        score += 15.0
                        break

    # Urgency-based scoring (10 points)
    if urgency:
        if urgency.lower() == 'urgent':
            # Prioritize hospitals and clinics for urgent cases
            if profile.caregiver_type in [CaregiverType.HOSPITAL, CaregiverType.CLINIC]:
                score += 10.0
            # Prioritize those with in-person consultation
            if profile.consultation_modes and 'in-person' in profile.consultation_modes.lower():
                score += 5.0
        elif urgency.lower() in ['medium', 'high']:
            # All types are suitable for medium/high urgency
            score += 5.0

    # Experience bonus (10 points)
    if profile.years_of_experience:
        if profile.years_of_experience >= 10:
            score += 10.0
        elif profile.years_of_experience >= 5:
            score += 7.0
        elif profile.years_of_experience >= 2:
            score += 5.0

    # Rating bonus (10 points)
    if profile.rating:
        score += (profile.rating / 5.0) * 10.0

    # Consultation count bonus (5 points)
    if profile.total_consultations >= 100:
        score += 5.0
    elif profile.total_consultations >= 50:
        score += 3.0
    elif profile.total_consultations >= 10:
        score += 2.0

    return min(score, 100.0)  # Cap at 100


@router.get("/list", response_model=List[CaregiverResponse])
async def list_caregivers(
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = Query(default="India"),
    specialization: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List all verified caregivers with optional filters"""
    query = db.query(User, CaregiverProfile).join(
        CaregiverProfile, User.id == CaregiverProfile.user_id
    ).filter(
        User.role == UserRole.CAREGIVER,
        User.is_active == True,
        CaregiverProfile.is_verified == True
    )

    if city:
        query = query.filter(CaregiverProfile.business_city.ilike(f"%{city}%"))
    if state:
        query = query.filter(CaregiverProfile.business_state.ilike(f"%{state}%"))
    if country:
        query = query.filter(CaregiverProfile.business_country.ilike(f"%{country}%"))
    if specialization:
        query = query.filter(CaregiverProfile.specialization.ilike(f"%{specialization}%"))

    caregivers = query.limit(limit).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "business_name": profile.business_name,
            "caregiver_type": profile.caregiver_type.value,
            "specialization": profile.specialization,
            "consultation_modes": profile.consultation_modes,
            "years_of_experience": profile.years_of_experience,
            "rating": profile.rating,
            "total_consultations": profile.total_consultations,
            "business_city": profile.business_city,
            "business_state": profile.business_state,
            "business_country": profile.business_country,
            "match_score": 0.0  # No scoring for simple list
        }
        for user, profile in caregivers
    ]
