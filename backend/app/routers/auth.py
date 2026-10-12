from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models.entities import User, CandidateProfile, Notification, AuditLog, UserRole, UserStatus
from app.schemas.dto import UserRegister, UserLogin, TokenResponse
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_candidate(req: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    # By default, registration requires admin approval
    new_user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        password_hash=get_password_hash(req.password),
        role=UserRole.CANDIDATE,
        status=UserStatus.PENDING, # Pending Admin Approval
        phone=req.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Parse optional dob safely
    parsed_dob = None
    if req.dob and req.dob.strip():
        try:
            from datetime import datetime
            parsed_dob = datetime.strptime(req.dob.strip(), "%Y-%m-%d").date()
        except Exception:
            parsed_dob = None

    # Create Candidate Profile
    profile = CandidateProfile(
        user_id=new_user.id,
        qualification=req.qualification,
        stream_specialization=req.stream_specialization,
        academic_percentage=req.academic_percentage,
        passing_year=req.passing_year,
        preferred_city_id=req.preferred_city_id,
        dob=parsed_dob,
        gender=req.gender,
        skills=req.skills,
        address=req.address
    )
    db.add(profile)

    # Create Welcome Notification
    notification = Notification(
        user_id=new_user.id,
        title="Registration Received",
        message="Your application registration is awaiting administrator review. You will receive access once approved.",
        notification_type="SYSTEM"
    )
    db.add(notification)

    # Audit log
    audit = AuditLog(
        performed_by_user_id=new_user.id,
        action="USER_REGISTERED",
        details=f"Candidate {new_user.email} registered with {req.qualification} ({req.academic_percentage}%)."
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Registration successful! Your account is pending administrator approval before examination access.",
        "user_id": new_user.id,
        "status": new_user.status.value
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Check status for candidates
    if user.role == UserRole.CANDIDATE and user.status in [UserStatus.PENDING, UserStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account status is {user.status.value}. Please wait for administrator verification approval."
        )

    if user.status == UserStatus.INACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact administration."
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value, "email": user.email}
    )

    # Record login audit
    audit = AuditLog(
        performed_by_user_id=user.id,
        action="USER_LOGIN",
        details=f"User {user.email} logged in successfully."
    )
    db.add(audit)
    db.commit()

    user_info = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "status": user.status.value,
        "phone": user.phone
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_info
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value,
        "status": current_user.status.value,
        "phone": current_user.phone,
        "created_at": current_user.created_at
    }

    if current_user.role == UserRole.CANDIDATE and current_user.candidate_profile:
        cp = current_user.candidate_profile
        data["candidate_profile"] = {
            "id": cp.id,
            "qualification": cp.qualification,
            "stream_specialization": cp.stream_specialization,
            "academic_percentage": float(cp.academic_percentage),
            "passing_year": cp.passing_year,
            "preferred_city_id": cp.preferred_city_id,
            "preferred_city": cp.preferred_city.city_name if cp.preferred_city else None,
            "allocated_centre_id": cp.allocated_centre_id,
            "allocated_centre": cp.allocated_centre.centre_name if cp.allocated_centre else None,
            "resume_path": cp.resume_path,
            "address": cp.address,
            "dob": cp.dob,
            "gender": cp.gender.value if cp.gender else None,
            "skills": cp.skills
        }
    elif current_user.role == UserRole.HR and current_user.hr_profile:
        hp = current_user.hr_profile
        data["hr_profile"] = {
            "employee_code": hp.employee_code,
            "department": hp.department,
            "designation": hp.designation
        }

    return data
