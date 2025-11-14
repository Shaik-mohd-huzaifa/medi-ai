"""
Seed script to populate database with dummy caregivers
Run this script to add sample caregiver data for testing
"""
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.user import User, CaregiverProfile, UserRole, CaregiverType
from app.utils.auth import get_password_hash

def create_dummy_caregivers():
    """Create 15 dummy caregivers with diverse profiles"""
    db = SessionLocal()
    
    caregivers_data = [
        {
            "email": "dr.sharma@mediai.com",
            "password": "password123",
            "full_name": "Dr. Rajesh Sharma",
            "phone": "+91-9876543210",
            "business_name": "Sharma Medical Center",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Cardiology, Internal Medicine",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 15,
            "rating": 5,
            "total_consultations": 245,
            "business_city": "Mumbai",
            "business_state": "Maharashtra",
            "business_country": "India",
            "business_description": "Specialized in heart diseases and preventive cardiology"
        },
        {
            "email": "dr.patel@mediai.com",
            "password": "password123",
            "full_name": "Dr. Priya Patel",
            "phone": "+91-9876543211",
            "business_name": "Patel Pediatric Clinic",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Pediatrics, Child Development",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 12,
            "rating": 5,
            "total_consultations": 189,
            "business_city": "Delhi",
            "business_state": "Delhi",
            "business_country": "India",
            "business_description": "Complete child healthcare from newborn to adolescence"
        },
        {
            "email": "apollo.jayanagar@mediai.com",
            "password": "password123",
            "full_name": "Dr. Admin Apollo",
            "phone": "+91-9876543212",
            "business_name": "Apollo Hospital Jayanagar",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Emergency Medicine, Surgery, Cardiology",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 25,
            "rating": 5,
            "total_consultations": 5247,
            "business_city": "Jayanagar",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Leading multi-specialty hospital with 24/7 emergency services in Jayanagar"
        },
        {
            "email": "sagar.jayanagar@mediai.com",
            "password": "password123",
            "full_name": "Dr. Rajesh Kumar",
            "phone": "+91-9876543290",
            "business_name": "Sagar Hospitals Jayanagar",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Cardiology, Emergency Care, General Medicine",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 22,
            "rating": 5,
            "total_consultations": 4892,
            "business_city": "Jayanagar",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Comprehensive healthcare with advanced cardiac care center"
        },
        {
            "email": "cloudnine.jayanagar@mediai.com",
            "password": "password123",
            "full_name": "Dr. Priya Sharma",
            "phone": "+91-9876543291",
            "business_name": "Cloudnine Hospital Jayanagar",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "General Medicine, Emergency Care, Pediatrics, Gynecology",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 18,
            "rating": 5,
            "total_consultations": 3567,
            "business_city": "Jayanagar",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Modern hospital with excellent maternity and general care services"
        },
        {
            "email": "manipal.jayanagar@mediai.com",
            "password": "password123",
            "full_name": "Dr. Suresh Reddy",
            "phone": "+91-9876543292",
            "business_name": "Manipal Hospitals Jayanagar",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Neurology, Orthopedics, Emergency Medicine",
            "consultation_modes": "video, in-person",
            "years_of_experience": 28,
            "rating": 5,
            "total_consultations": 6234,
            "business_city": "Jayanagar",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Premier multi-specialty hospital with advanced diagnostic facilities"
        },
        {
            "email": "dr.singh@mediai.com",
            "password": "password123",
            "full_name": "Dr. Amar Singh",
            "phone": "+91-9876543213",
            "business_name": "Singh Orthopedic Center",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Orthopedics, Sports Medicine",
            "consultation_modes": "video, in-person",
            "years_of_experience": 18,
            "rating": 5,
            "total_consultations": 312,
            "business_city": "Pune",
            "business_state": "Maharashtra",
            "business_country": "India",
            "business_description": "Expert in bone and joint treatments, sports injuries"
        },
        {
            "email": "dr.reddy@mediai.com",
            "password": "password123",
            "full_name": "Dr. Lakshmi Reddy",
            "phone": "+91-9876543214",
            "business_name": "Reddy Dermatology Clinic",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Dermatology, Cosmetology",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 10,
            "rating": 5,
            "total_consultations": 156,
            "business_city": "Hyderabad",
            "business_state": "Telangana",
            "business_country": "India",
            "business_description": "Skin care specialist with focus on cosmetic treatments"
        },
        {
            "email": "dr.verma@mediai.com",
            "password": "password123",
            "full_name": "Dr. Ankit Verma",
            "phone": "+91-9876543215",
            "business_name": "Verma Neurology Center",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Neurology, Headache Treatment",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 14,
            "rating": 4,
            "total_consultations": 198,
            "business_city": "Chennai",
            "business_state": "Tamil Nadu",
            "business_country": "India",
            "business_description": "Neurologist specializing in migraine and neurological disorders"
        },
        {
            "email": "fortis.delhi@mediai.com",
            "password": "password123",
            "full_name": "Dr. Admin Fortis",
            "phone": "+91-9876543216",
            "business_name": "Fortis Hospital Delhi",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Oncology, Cardiology, Neurology",
            "consultation_modes": "video, in-person",
            "years_of_experience": 20,
            "rating": 5,
            "total_consultations": 892,
            "business_city": "Delhi",
            "business_state": "Delhi",
            "business_country": "India",
            "business_description": "Advanced multi-specialty hospital with cancer care center"
        },
        {
            "email": "dr.gupta@mediai.com",
            "password": "password123",
            "full_name": "Dr. Meera Gupta",
            "phone": "+91-9876543217",
            "business_name": "Gupta Gastro Care",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Gastroenterology, Hepatology",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 11,
            "rating": 5,
            "total_consultations": 167,
            "business_city": "Mumbai",
            "business_state": "Maharashtra",
            "business_country": "India",
            "business_description": "Digestive health specialist with advanced endoscopy facilities"
        },
        {
            "email": "dr.nair@mediai.com",
            "password": "password123",
            "full_name": "Dr. Suresh Nair",
            "phone": "+91-9876543218",
            "business_name": "Nair Eye Hospital",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Ophthalmology, Eye Surgery",
            "consultation_modes": "video, in-person",
            "years_of_experience": 16,
            "rating": 5,
            "total_consultations": 423,
            "business_city": "Bangalore",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Complete eye care with LASIK and cataract surgery"
        },
        {
            "email": "dr.khan@mediai.com",
            "password": "password123",
            "full_name": "Dr. Fatima Khan",
            "phone": "+91-9876543219",
            "business_name": "Khan Women's Health Clinic",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Obstetrics, Gynecology",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 13,
            "rating": 5,
            "total_consultations": 234,
            "business_city": "Kolkata",
            "business_state": "West Bengal",
            "business_country": "India",
            "business_description": "Women's health specialist for pregnancy and gynecological care"
        },
        {
            "email": "dr.iyer@mediai.com",
            "password": "password123",
            "full_name": "Dr. Ramesh Iyer",
            "phone": "+91-9876543220",
            "business_name": "Iyer Pulmonology Center",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Pulmonology, Respiratory Medicine",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 9,
            "rating": 4,
            "total_consultations": 134,
            "business_city": "Chennai",
            "business_state": "Tamil Nadu",
            "business_country": "India",
            "business_description": "Lung and respiratory specialist, asthma and COPD expert"
        },
        {
            "email": "dr.mehta@mediai.com",
            "password": "password123",
            "full_name": "Dr. Vikram Mehta",
            "phone": "+91-9876543221",
            "business_name": "Mehta Psychiatry Clinic",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Psychiatry, Psychology, Mental Health",
            "consultation_modes": "chat, video",
            "years_of_experience": 8,
            "rating": 5,
            "total_consultations": 289,
            "business_city": "Mumbai",
            "business_state": "Maharashtra",
            "business_country": "India",
            "business_description": "Mental health specialist for anxiety, depression, stress management"
        },
        {
            "email": "max.saket@mediai.com",
            "password": "password123",
            "full_name": "Dr. Admin Max",
            "phone": "+91-9876543222",
            "business_name": "Max Hospital Saket",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Emergency, Trauma Care, ICU",
            "consultation_modes": "video, in-person",
            "years_of_experience": 22,
            "rating": 5,
            "total_consultations": 1567,
            "business_city": "Delhi",
            "business_state": "Delhi",
            "business_country": "India",
            "business_description": "Super-specialty hospital with advanced trauma and emergency care"
        },
        {
            "email": "dr.desai@mediai.com",
            "password": "password123",
            "full_name": "Dr. Kiran Desai",
            "phone": "+91-9876543223",
            "business_name": "Desai General Practice",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "General Medicine, Family Medicine",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 7,
            "rating": 4,
            "total_consultations": 98,
            "business_city": "Ahmedabad",
            "business_state": "Gujarat",
            "business_country": "India",
            "business_description": "Family doctor for routine checkups and common ailments"
        },
        {
            "email": "dr.rao@mediai.com",
            "password": "password123",
            "full_name": "Dr. Venkat Rao",
            "phone": "+91-9876543224",
            "business_name": "Rao ENT Specialist",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "ENT, Otolaryngology",
            "consultation_modes": "video, in-person",
            "years_of_experience": 12,
            "rating": 5,
            "total_consultations": 176,
            "business_city": "Hyderabad",
            "business_state": "Telangana",
            "business_country": "India",
            "business_description": "Ear, nose, and throat specialist with micro-ear surgery expertise"
        },
        {
            "email": "dr.chopra@mediai.com",
            "password": "password123",
            "full_name": "Dr. Neha Chopra",
            "phone": "+91-9876543225",
            "business_name": "Chopra Diabetes Center",
            "caregiver_type": CaregiverType.CLINIC,
            "specialization": "Endocrinology, Diabetes, Thyroid",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 10,
            "rating": 5,
            "total_consultations": 312,
            "business_city": "Pune",
            "business_state": "Maharashtra",
            "business_country": "India",
            "business_description": "Diabetes and hormone specialist with lifestyle counseling"
        },
        {
            "email": "dr.joshi@mediai.com",
            "password": "password123",
            "full_name": "Dr. Amit Joshi",
            "phone": "+91-9876543226",
            "business_name": "Joshi Infectious Disease Center",
            "caregiver_type": CaregiverType.INDIVIDUAL_DOCTOR,
            "specialization": "Infectious Disease, Internal Medicine",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 11,
            "rating": 4,
            "total_consultations": 145,
            "business_city": "Bangalore",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Specialist in viral and bacterial infections, fever management"
        },
        {
            "email": "manipal.hospital@mediai.com",
            "password": "password123",
            "full_name": "Dr. Admin Manipal",
            "phone": "+91-9876543227",
            "business_name": "Manipal Hospital",
            "caregiver_type": CaregiverType.HOSPITAL,
            "specialization": "Multi-specialty, Emergency, Surgery, Critical Care",
            "consultation_modes": "chat, video, in-person",
            "years_of_experience": 28,
            "rating": 5,
            "total_consultations": 2134,
            "business_city": "Bangalore",
            "business_state": "Karnataka",
            "business_country": "India",
            "business_description": "Comprehensive healthcare with advanced medical technology"
        },
    ]
    
    created_count = 0
    
    for data in caregivers_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == data["email"]).first()
        if existing_user:
            print(f"Skipping {data['email']} - already exists")
            continue
        
        # Create user
        user = User(
            email=data["email"],
            hashed_password=get_password_hash(data["password"]),
            full_name=data["full_name"],
            phone_number=data["phone"],
            role=UserRole.CAREGIVER,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.flush()  # Get user.id
        
        # Create caregiver profile
        profile = CaregiverProfile(
            user_id=user.id,
            caregiver_type=data["caregiver_type"],
            business_name=data["business_name"],
            business_description=data["business_description"],
            specialization=data["specialization"],
            consultation_modes=data["consultation_modes"],
            years_of_experience=data["years_of_experience"],
            rating=data["rating"],
            total_consultations=data["total_consultations"],
            business_city=data["business_city"],
            business_state=data["business_state"],
            business_country=data["business_country"],
            is_verified=True,
            profile_completed=True,
            onboarding_step=3
        )
        db.add(profile)
        
        created_count += 1
        print(f"✅ Created: {data['full_name']} - {data['business_name']}")
    
    db.commit()
    db.close()
    
    print(f"\n🎉 Successfully created {created_count} caregivers!")
    print("Password for all caregivers: password123")

if __name__ == "__main__":
    print("🏥 Starting caregiver seed script...")
    print("=" * 60)
    create_dummy_caregivers()
    print("=" * 60)
    print("✅ Seed complete! You can now test caregiver matching.")
