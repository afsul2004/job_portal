import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.config import settings
from app.models.entities import (
    User, CandidateProfile, Application, JobPosition, ExamResult,
    ExamCity, ExamCentre, Notification, AuditLog
)
from app.schemas.dto import CandidateProfileUpdate
from app.auth import get_current_user, require_candidate

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("/profile")
def get_candidate_profile(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    profile = current_user.candidate_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "status": current_user.status.value,
        "qualification": profile.qualification,
        "stream_specialization": profile.stream_specialization,
        "academic_percentage": float(profile.academic_percentage),
        "passing_year": profile.passing_year,
        "preferred_city_id": profile.preferred_city_id,
        "preferred_city": profile.preferred_city.city_name if profile.preferred_city else None,
        "allocated_centre_id": profile.allocated_centre_id,
        "allocated_centre": profile.allocated_centre.centre_name if profile.allocated_centre else None,
        "resume_path": profile.resume_path,
        "address": profile.address,
        "dob": profile.dob,
        "gender": profile.gender.value if profile.gender else None,
        "skills": profile.skills
    }

@router.put("/profile")
def update_candidate_profile(
    req: CandidateProfileUpdate,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = current_user.candidate_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    for k, v in req.dict(exclude_unset=True).items():
        if v is not None:
            setattr(profile, k, v)

    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    profile = current_user.candidate_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    # Validate PDF extension and content type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents (.pdf) are allowed for resumes."
        )

    # Secure random filename
    filename = f"resume_{current_user.id}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile.resume_path = f"/uploads/resumes/{filename}"
    db.commit()

    return {
        "message": "Resume uploaded successfully",
        "resume_path": profile.resume_path,
        "filename": filename
    }

@router.get("/applications")
def get_my_applications(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.candidate_id == current_user.id).all()
    results = []
    for a in apps:
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "Unknown",
            "department": a.job.department if a.job else "-",
            "status": a.status.value,
            "remarks": a.remarks,
            "application_date": a.application_date
        })
    return results

@router.post("/apply/{job_id}")
def apply_for_job(job_id: int, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    job = db.query(JobPosition).filter(JobPosition.id == job_id, JobPosition.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Active job position not found")

    existing = db.query(Application).filter(
        Application.candidate_id == current_user.id,
        Application.job_id == job_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position")

    # Check if candidate has completed test
    latest_result = db.query(ExamResult).filter(ExamResult.candidate_id == current_user.id).order_by(ExamResult.submitted_at.desc()).first()
    initial_status = "TEST_COMPLETED" if latest_result else "APPLIED"

    app = Application(
        candidate_id=current_user.id,
        job_id=job_id,
        status=initial_status,
        remarks=f"Applied online on {current_user.created_at.strftime('%Y-%m-%d')}"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    return {"message": f"Successfully applied for {job.title}", "application_id": app.id, "status": app.status.value}
