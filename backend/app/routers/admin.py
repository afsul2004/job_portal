from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.entities import (
    User, CandidateProfile, HRProfile, ExamCity, ExamCentre,
    Question, Exam, ExamQuestion, Application, ExamResult, AuditLog,
    UserRole, UserStatus, Notification
)
from app.schemas.dto import (
    UserStatusUpdate, CreateHRRequest, ExamCityCreate, ExamCentreCreate,
    QuestionCreate, QuestionUpdate, ExamCreate, ExamUpdate
)
from app.auth import require_admin, get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

@router.get("/dashboard-stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_candidates = db.query(User).filter(User.role == UserRole.CANDIDATE).count()
    pending_approvals = db.query(User).filter(User.role == UserRole.CANDIDATE, User.status == UserStatus.PENDING).count()
    approved_candidates = db.query(User).filter(User.role == UserRole.CANDIDATE, User.status == UserStatus.APPROVED).count()
    total_exams = db.query(Exam).count()
    total_questions = db.query(Question).count()
    total_applications = db.query(Application).count()
    completed_exams = db.query(ExamResult).count()
    selected_candidates = db.query(Application).filter(Application.status == "SELECTED").count()
    shortlisted_candidates = db.query(Application).filter(Application.status == "SHORTLISTED").count()
    total_centres = db.query(ExamCentre).count()
    total_cities = db.query(ExamCity).count()

    recent_activities = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()

    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "pending_approvals": pending_approvals,
        "approved_candidates": approved_candidates,
        "total_exams": total_exams,
        "total_questions": total_questions,
        "total_applications": total_applications,
        "completed_exams": completed_exams,
        "selected_candidates": selected_candidates,
        "shortlisted_candidates": shortlisted_candidates,
        "total_centres": total_centres,
        "total_cities": total_cities,
        "recent_activities": [
            {
                "id": a.id,
                "action": a.action,
                "details": a.details,
                "timestamp": a.created_at
            } for a in recent_activities
        ]
    }

# 1. Manage User Registrations & Approvals
@router.get("/users")
def list_users(role: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if status:
        q = q.filter(User.status == status)
    
    users = q.order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        item = {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "status": u.status.value,
            "created_at": u.created_at
        }
        if u.candidate_profile:
            cp = u.candidate_profile
            item["profile"] = {
                "qualification": cp.qualification,
                "percentage": float(cp.academic_percentage),
                "passing_year": cp.passing_year,
                "preferred_city": cp.preferred_city.city_name if cp.preferred_city else None,
                "allocated_centre": cp.allocated_centre.centre_name if cp.allocated_centre else None
            }
        results.append(item)
    return results

@router.put("/users/{user_id}/status")
def update_user_status(user_id: int, req: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = user.status.value
    user.status = req.status
    db.commit()

    # Automatically notify candidate
    notif_msg = f"Your account status has been updated to {req.status} by the administrator."
    if req.status == "APPROVED":
        notif_msg = "Congratulations! Your registration has been APPROVED. You can now log in, take online exams, and view job positions."
    elif req.status == "REJECTED":
        notif_msg = "Your registration request was not approved by administration."

    notif = Notification(
        user_id=user.id,
        title=f"Account Status: {req.status}",
        message=notif_msg,
        notification_type="APPROVAL"
    )
    db.add(notif)

    # Log action
    audit = AuditLog(
        performed_by_user_id=admin.id,
        action="USER_STATUS_UPDATE",
        details=f"Admin changed status for {user.email} from {old_status} to {req.status}."
    )
    db.add(audit)
    db.commit()

    return {"message": f"User status updated to {req.status}", "user_id": user_id, "new_status": req.status}

# 2. Manage HR Accounts
@router.post("/hr-accounts")
def create_hr_account(req: CreateHRRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_hr = User(
        full_name=req.full_name,
        email=req.email.lower().strip(),
        password_hash=get_password_hash(req.password),
        role=UserRole.HR,
        status=UserStatus.ACTIVE,
        phone=req.phone
    )
    db.add(new_hr)
    db.commit()
    db.refresh(new_hr)

    hr_profile = HRProfile(
        user_id=new_hr.id,
        employee_code=req.employee_code,
        department=req.department,
        designation=req.designation
    )
    db.add(hr_profile)

    audit = AuditLog(
        performed_by_user_id=admin.id,
        action="HR_ACCOUNT_CREATED",
        details=f"Created HR account for {req.email} with code {req.employee_code}."
    )
    db.add(audit)
    db.commit()

    return {"message": "HR Account created successfully", "hr_id": new_hr.id}

@router.get("/hr-accounts")
def list_hr_accounts(db: Session = Depends(get_db)):
    hrs = db.query(User).filter(User.role == UserRole.HR).all()
    results = []
    for h in hrs:
        hp = h.hr_profile
        results.append({
            "id": h.id,
            "full_name": h.full_name,
            "email": h.email,
            "phone": h.phone,
            "status": h.status.value,
            "employee_code": hp.employee_code if hp else "-",
            "department": hp.department if hp else "-",
            "designation": hp.designation if hp else "-",
            "created_at": h.created_at
        })
    return results

# 3. Cities & Examination Centres Management
@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(ExamCity).all()
    return [{"id": c.id, "city_name": c.city_name, "state": c.state} for c in cities]

@router.post("/cities")
def create_city(req: ExamCityCreate, db: Session = Depends(get_db)):
    existing = db.query(ExamCity).filter(ExamCity.city_name == req.city_name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="City already exists")
    city = ExamCity(city_name=req.city_name.strip(), state=req.state.strip())
    db.add(city)
    db.commit()
    return {"message": "City added successfully", "id": city.id}

@router.get("/centres")
def get_centres(city_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(ExamCentre)
    if city_id:
        q = q.filter(ExamCentre.city_id == city_id)
    centres = q.all()
    return [
        {
            "id": c.id,
            "city_id": c.city_id,
            "city_name": c.city.city_name if c.city else None,
            "centre_name": c.centre_name,
            "centre_code": c.centre_code,
            "address": c.address,
            "total_capacity": c.total_capacity,
            "allocated_seats": c.allocated_seats,
            "available_seats": c.total_capacity - c.allocated_seats
        } for c in centres
    ]

@router.post("/centres")
def create_centre(req: ExamCentreCreate, db: Session = Depends(get_db)):
    existing = db.query(ExamCentre).filter(ExamCentre.centre_code == req.centre_code.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Centre code already exists")
    centre = ExamCentre(
        city_id=req.city_id,
        centre_name=req.centre_name,
        centre_code=req.centre_code,
        address=req.address,
        total_capacity=req.total_capacity
    )
    db.add(centre)
    db.commit()
    return {"message": "Examination centre created successfully", "id": centre.id}

# 4. Question Bank CRUD
@router.get("/questions")
def list_questions(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Question)
    if category:
        q = q.filter(Question.category == category)
    items = q.order_by(Question.id.asc()).all()
    return [
        {
            "id": it.id,
            "category": it.category,
            "question_text": it.question_text,
            "option_a": it.option_a,
            "option_b": it.option_b,
            "option_c": it.option_c,
            "option_d": it.option_d,
            "correct_option": it.correct_option,
            "marks": float(it.marks),
            "explanation": it.explanation
        } for it in items
    ]

@router.post("/questions")
def create_question(req: QuestionCreate, db: Session = Depends(get_db)):
    q = Question(
        category=req.category,
        question_text=req.question_text,
        option_a=req.option_a,
        option_b=req.option_b,
        option_c=req.option_c,
        option_d=req.option_d,
        correct_option=req.correct_option.upper(),
        marks=req.marks,
        explanation=req.explanation
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"message": "Question created successfully", "id": q.id}

@router.put("/questions/{question_id}")
def update_question(question_id: int, req: QuestionUpdate, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for field, val in req.dict(exclude_unset=True).items():
        if val is not None:
            if field == "correct_option":
                val = val.upper()
            setattr(q, field, val)

    db.commit()
    return {"message": "Question updated successfully"}

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted successfully"}

# 5. Exam Configuration & Settings
@router.get("/exams")
def list_exams(db: Session = Depends(get_db)):
    exams = db.query(Exam).order_by(Exam.id.desc()).all()
    results = []
    for e in exams:
        results.append({
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "duration_minutes": e.duration_minutes,
            "total_questions": e.total_questions,
            "total_marks": float(e.total_marks),
            "passing_marks": float(e.passing_marks),
            "is_published": e.is_published,
            "randomize_questions": e.randomize_questions,
            "instructions": e.instructions,
            "linked_questions_count": len(e.exam_questions),
            "question_ids": [eq.question_id for eq in e.exam_questions]
        })
    return results

@router.post("/exams")
def create_exam(req: ExamCreate, db: Session = Depends(get_db)):
    exam = Exam(
        title=req.title,
        category=req.category,
        duration_minutes=req.duration_minutes,
        total_questions=req.total_questions,
        total_marks=req.total_marks,
        passing_marks=req.passing_marks,
        is_published=req.is_published,
        randomize_questions=req.randomize_questions,
        instructions=req.instructions
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    if req.question_ids:
        for q_id in req.question_ids:
            db.add(ExamQuestion(exam_id=exam.id, question_id=q_id))
        db.commit()

    return {"message": "Exam created successfully", "id": exam.id}

@router.put("/exams/{exam_id}")
def update_exam(exam_id: int, req: ExamUpdate, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    update_data = req.dict(exclude_unset=True)
    question_ids = update_data.pop("question_ids", None)

    for field, val in update_data.items():
        if val is not None:
            setattr(exam, field, val)

    if question_ids is not None:
        db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).delete()
        for qid in question_ids:
            db.add(ExamQuestion(exam_id=exam.id, question_id=qid))

    db.commit()
    return {"message": "Exam configuration updated successfully"}

@router.delete("/exams/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return {"message": "Exam deleted successfully"}

# 6. Candidate Examination Reports & Marks
@router.get("/reports/results")
def get_all_results_report(db: Session = Depends(get_db)):
    results = db.query(ExamResult).order_by(ExamResult.submitted_at.desc()).all()
    items = []
    for r in results:
        cand = r.candidate
        prof = cand.candidate_profile if cand else None
        items.append({
            "result_id": r.id,
            "candidate_id": r.candidate_id,
            "candidate_name": cand.full_name if cand else "Unknown",
            "candidate_email": cand.email if cand else "",
            "qualification": prof.qualification if prof else "-",
            "academic_percentage": float(prof.academic_percentage) if prof else 0.0,
            "exam_title": r.exam.title if r.exam else "-",
            "score_obtained": float(r.score_obtained),
            "max_score": float(r.max_score),
            "percentage": float(r.percentage),
            "is_passed": r.is_passed,
            "submitted_at": r.submitted_at
        })
    return items
