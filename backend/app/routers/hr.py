from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.entities import (
    User, CandidateProfile, Application, JobPosition, ExamResult,
    EligibilityRecord, EmployeeRecord, Notification, AuditLog,
    UserRole, ApplicationStatus
)
from app.schemas.dto import (
    ApplicationStatusUpdate, CreateEmployeeRecord, UpdateEmployeeRecord
)
from app.auth import require_hr

router = APIRouter(prefix="/hr", tags=["HR / Recruitment"], dependencies=[Depends(require_hr)])

@router.get("/dashboard-stats")
def get_hr_dashboard_stats(db: Session = Depends(get_db)):
    total_candidates = db.query(User).filter(User.role == UserRole.CANDIDATE).count()
    total_applications = db.query(Application).count()
    shortlisted_count = db.query(Application).filter(Application.status == ApplicationStatus.SHORTLISTED).count()
    selected_count = db.query(Application).filter(Application.status == ApplicationStatus.SELECTED).count()
    total_employees = db.query(EmployeeRecord).count()

    # Eligible counts
    programmer_job = db.query(JobPosition).filter(JobPosition.title == "Programmer").first()
    deo_job = db.query(JobPosition).filter(JobPosition.title == "Data Entry Operator").first()

    eligible_programmers = db.query(EligibilityRecord).filter(
        EligibilityRecord.job_id == (programmer_job.id if programmer_job else 0),
        EligibilityRecord.is_eligible == True
    ).count()

    eligible_deo = db.query(EligibilityRecord).filter(
        EligibilityRecord.job_id == (deo_job.id if deo_job else 0),
        EligibilityRecord.is_eligible == True
    ).count()

    return {
        "total_candidates": total_candidates,
        "total_applications": total_applications,
        "shortlisted_candidates": shortlisted_count,
        "selected_candidates": selected_count,
        "total_employees": total_employees,
        "eligible_programmers": eligible_programmers,
        "eligible_data_entry_operators": eligible_deo
    }

# 1. View & Filter Candidates with Advanced Search
@router.get("/candidates")
def search_candidates(
    qualification: Optional[str] = None,
    min_percentage: Optional[float] = None,
    min_score: Optional[float] = None,
    job_id: Optional[int] = None,
    eligibility_status: Optional[str] = None, # 'ELIGIBLE', 'NOT_ELIGIBLE', 'ALL'
    db: Session = Depends(get_db)
):
    candidates = db.query(User).filter(User.role == UserRole.CANDIDATE).all()
    results = []

    for c in candidates:
        prof = c.candidate_profile
        if not prof:
            continue

        # Filters
        if qualification and qualification.lower() not in prof.qualification.lower():
            continue
        if min_percentage and float(prof.academic_percentage) < min_percentage:
            continue

        # Latest result
        latest_res = db.query(ExamResult).filter(ExamResult.candidate_id == c.id).order_by(ExamResult.submitted_at.desc()).first()
        if min_score and (not latest_res or float(latest_res.score_obtained) < min_score):
            continue

        # Eligibility check
        elig_records = db.query(EligibilityRecord).filter(EligibilityRecord.candidate_id == c.id).all()
        elig_map = {er.job.title: {"eligible": er.is_eligible, "reason": er.decision_reason} for er in elig_records if er.job}

        # Applications
        apps = db.query(Application).filter(Application.candidate_id == c.id).all()

        results.append({
            "candidate_id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "qualification": prof.qualification,
            "stream": prof.stream_specialization,
            "academic_percentage": float(prof.academic_percentage),
            "passing_year": prof.passing_year,
            "preferred_city": prof.preferred_city.city_name if prof.preferred_city else None,
            "allocated_centre": prof.allocated_centre.centre_name if prof.allocated_centre else None,
            "resume_path": prof.resume_path,
            "skills": prof.skills,
            "latest_exam_score": float(latest_res.score_obtained) if latest_res else None,
            "latest_exam_percentage": float(latest_res.percentage) if latest_res else None,
            "latest_exam_title": latest_res.exam.title if (latest_res and latest_res.exam) else None,
            "eligibility": elig_map,
            "applications": [
                {
                    "app_id": a.id,
                    "job_id": a.job_id,
                    "job_title": a.job.title if a.job else "-",
                    "status": a.status.value,
                    "remarks": a.remarks
                } for a in apps
            ]
        })

    return results

# 2. View All Applications & Update Recruitment Status
@router.get("/applications")
def list_all_applications(db: Session = Depends(get_db)):
    apps = db.query(Application).order_by(Application.created_at.desc()).all()
    output = []
    for a in apps:
        cand = a.candidate
        prof = cand.candidate_profile if cand else None
        res = db.query(ExamResult).filter(ExamResult.candidate_id == cand.id).order_by(ExamResult.submitted_at.desc()).first()
        elig = db.query(EligibilityRecord).filter(
            EligibilityRecord.candidate_id == cand.id,
            EligibilityRecord.job_id == a.job_id
        ).first()

        output.append({
            "id": a.id,
            "candidate_id": cand.id,
            "candidate_name": cand.full_name,
            "candidate_email": cand.email,
            "candidate_phone": cand.phone,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "-",
            "qualification": prof.qualification if prof else "-",
            "academic_percentage": float(prof.academic_percentage) if prof else 0.0,
            "resume_path": prof.resume_path if prof else None,
            "exam_score": float(res.score_obtained) if res else None,
            "is_eligible": elig.is_eligible if elig else None,
            "eligibility_reason": elig.decision_reason if elig else None,
            "status": a.status.value,
            "remarks": a.remarks,
            "applied_at": a.application_date
        })
    return output

@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    req: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    hr_user: User = Depends(require_hr)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status.value
    app.status = req.status
    if req.remarks:
        app.remarks = req.remarks

    # Notify candidate
    notif = Notification(
        user_id=app.candidate_id,
        title=f"Application Status Updated: {req.status}",
        message=f"Your application status for {app.job.title if app.job else 'the job'} has been set to {req.status}. Notes: {req.remarks or 'N/A'}",
        notification_type="RECRUITMENT"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        performed_by_user_id=hr_user.id,
        action="APPLICATION_STATUS_UPDATE",
        details=f"HR {hr_user.email} updated Application #{app.id} status from {old_status} to {req.status}."
    )
    db.add(audit)
    db.commit()

    return {"message": f"Application status updated to {req.status}", "application_id": application_id}

# 3. Employee Records Management
@router.get("/employees")
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(EmployeeRecord).order_by(EmployeeRecord.id.desc()).all()
    results = []
    for emp in employees:
        cand = emp.user
        results.append({
            "id": emp.id,
            "user_id": emp.user_id,
            "employee_id_number": emp.employee_id_number,
            "full_name": cand.full_name if cand else "-",
            "email": cand.email if cand else "-",
            "phone": cand.phone if cand else "-",
            "designation": emp.designation,
            "department": emp.department,
            "joining_date": emp.joining_date,
            "salary": float(emp.salary),
            "employment_status": emp.employment_status.value,
            "created_at": emp.created_at
        })
    return results

@router.post("/employees")
def create_employee(
    req: CreateEmployeeRecord,
    db: Session = Depends(get_db),
    hr_user: User = Depends(require_hr)
):
    existing = db.query(EmployeeRecord).filter(
        (EmployeeRecord.user_id == req.user_id) | (EmployeeRecord.employee_id_number == req.employee_id_number.strip())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee record already exists for this candidate or code")

    emp = EmployeeRecord(
        user_id=req.user_id,
        employee_id_number=req.employee_id_number.strip(),
        designation=req.designation,
        department=req.department,
        joining_date=req.joining_date,
        salary=req.salary,
        employment_status=req.employment_status,
        created_by_hr_id=hr_user.id
    )
    db.add(emp)

    # Set user status and application status to SELECTED
    user = db.query(User).filter(User.id == req.user_id).first()
    if user:
        user.status = "ACTIVE"

    db.add(Notification(
        user_id=req.user_id,
        title="Welcome to the Team!",
        message=f"Congratulations! You have been recruited as {req.designation} in {req.department}. Employee ID: {req.employee_id_number}.",
        notification_type="RECRUITMENT"
    ))

    db.commit()
    db.refresh(emp)

    return {"message": "Employee onboarding record created successfully", "employee_id": emp.id}

@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    req: UpdateEmployeeRecord,
    db: Session = Depends(get_db),
    hr_user: User = Depends(require_hr)
):
    emp = db.query(EmployeeRecord).filter(EmployeeRecord.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    for k, v in req.dict(exclude_unset=True).items():
        if v is not None:
            setattr(emp, k, v)

    db.commit()
    return {"message": "Employee record updated successfully"}
