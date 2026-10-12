from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.entities import JobPosition, Notification, User, ExamCity
from app.schemas.dto import JobPositionCreate, JobPositionUpdate
from app.auth import get_current_user, require_admin

router = APIRouter(tags=["Jobs & Notifications"])

# Public endpoint for registration form
@router.get("/cities")
def get_public_cities(db: Session = Depends(get_db)):
    cities = db.query(ExamCity).all()
    return [{"id": c.id, "city_name": c.city_name, "state": c.state} for c in cities]

# 1. Job Positions
@router.get("/jobs")
def get_jobs(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(JobPosition)
    if active_only:
        q = q.filter(JobPosition.is_active == True)
    jobs = q.all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "description": j.description,
            "min_academic_percentage": float(j.min_academic_percentage),
            "min_exam_score": float(j.min_exam_score),
            "max_exam_score": float(j.max_exam_score) if j.max_exam_score is not None else None,
            "openings_count": j.openings_count,
            "is_active": j.is_active
        } for j in jobs
    ]

@router.post("/jobs")
def create_job(req: JobPositionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = JobPosition(
        title=req.title,
        department=req.department,
        description=req.description,
        min_academic_percentage=req.min_academic_percentage,
        min_exam_score=req.min_exam_score,
        max_exam_score=req.max_exam_score,
        openings_count=req.openings_count,
        is_active=req.is_active
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"message": "Job position created successfully", "id": job.id}

@router.put("/jobs/{job_id}")
def update_job(job_id: int, req: JobPositionUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job position not found")

    for k, v in req.dict(exclude_unset=True).items():
        if v is not None:
            setattr(job, k, v)

    db.commit()
    return {"message": "Job position updated successfully"}

# 2. Notifications
@router.get("/notifications")
def get_user_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type.value,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifs
    ]

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.put("/notifications/mark-all-read")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}
