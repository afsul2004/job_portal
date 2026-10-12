import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.entities import (
    User, Exam, Question, ExamQuestion, ExamAttempt, CandidateAnswer,
    ExamResult, JobPosition, EligibilityRecord, Application, Notification,
    AttemptStatus, ApplicationStatus
)
from app.schemas.dto import SaveAnswerRequest, SubmitExamRequest
from app.auth import get_current_user, require_candidate
from app.eligibility import evaluate_candidate_eligibility

router = APIRouter(tags=["Online Examination"])

# 1. Candidate views available exams
@router.get("/exams")
def get_available_exams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exams = db.query(Exam).filter(Exam.is_published == True).all()
    results = []
    for e in exams:
        # Check if user has an attempt
        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.candidate_id == current_user.id,
            ExamAttempt.exam_id == e.id
        ).order_by(ExamAttempt.id.desc()).first()

        results.append({
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "duration_minutes": e.duration_minutes,
            "total_questions": e.total_questions,
            "total_marks": float(e.total_marks),
            "passing_marks": float(e.passing_marks),
            "instructions": e.instructions,
            "has_attempted": attempt is not None and attempt.status == AttemptStatus.COMPLETED,
            "attempt_status": attempt.status.value if attempt else "NOT_STARTED",
            "allow_retake": attempt.allow_retake if attempt else False
        })
    return results

@router.get("/exams/{exam_id}")
def get_exam_details(exam_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    return {
        "id": exam.id,
        "title": exam.title,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "total_questions": exam.total_questions,
        "total_marks": float(exam.total_marks),
        "passing_marks": float(exam.passing_marks),
        "instructions": exam.instructions
    }

# 2. Starting or Resuming an Exam Attempt
@router.post("/attempts/start/{exam_id}")
def start_exam_attempt(exam_id: int, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Check for existing completed attempt
    prev_attempt = db.query(ExamAttempt).filter(
        ExamAttempt.candidate_id == current_user.id,
        ExamAttempt.exam_id == exam_id
    ).order_by(ExamAttempt.id.desc()).first()

    if prev_attempt:
        if prev_attempt.status == AttemptStatus.COMPLETED and not prev_attempt.allow_retake:
            raise HTTPException(
                status_code=400,
                detail="You have already completed this examination. Retakes require administrative permission."
            )
        elif prev_attempt.status == AttemptStatus.IN_PROGRESS:
            # Resume existing attempt
            return {"message": "Resuming exam attempt", "attempt_id": prev_attempt.id}

    # Create new attempt
    attempt = ExamAttempt(
        candidate_id=current_user.id,
        exam_id=exam_id,
        status=AttemptStatus.IN_PROGRESS
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {"message": "Exam started successfully", "attempt_id": attempt.id}

# 3. Fetch Questions for an active attempt (WITHOUT correct answers!)
@router.get("/attempts/{attempt_id}/questions")
def get_attempt_questions(attempt_id: int, current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    attempt = db.query(ExamAttempt).filter(ExamAttempt.id == attempt_id, ExamAttempt.candidate_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Exam attempt not found")

    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail=f"Cannot fetch questions. Attempt is {attempt.status.value}.")

    exam = attempt.exam
    exam_questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).all()
    q_ids = [eq.question_id for eq in exam_questions]

    questions = db.query(Question).filter(Question.id.in_(q_ids)).all()
    if exam.randomize_questions:
        # Seed by attempt id so order remains consistent across refreshes for the candidate
        rnd = random.Random(attempt.id)
        rnd.shuffle(questions)

    # Get already saved answers
    saved_answers = db.query(CandidateAnswer).filter(CandidateAnswer.attempt_id == attempt.id).all()
    ans_map = {sa.question_id: sa.selected_option for sa in saved_answers}

    # NEVER return correct_option or explanation here!
    sanitized_questions = []
    for idx, q in enumerate(questions):
        sanitized_questions.append({
            "question_index": idx + 1,
            "id": q.id,
            "category": q.category,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "marks": float(q.marks),
            "selected_option": ans_map.get(q.id, None)
        })

    return {
        "attempt_id": attempt.id,
        "exam_title": exam.title,
        "duration_minutes": exam.duration_minutes,
        "start_time": attempt.start_time,
        "total_questions": len(sanitized_questions),
        "questions": sanitized_questions
    }

# 4. Save Candidate Answer Dynamically (Auto-save)
@router.post("/attempts/{attempt_id}/save-answer")
def save_answer(
    attempt_id: int,
    req: SaveAnswerRequest,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    attempt = db.query(ExamAttempt).filter(ExamAttempt.id == attempt_id, ExamAttempt.candidate_id == current_user.id).first()
    if not attempt or attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Cannot save answer. Exam attempt is not active.")

    selected = req.selected_option.upper().strip() if req.selected_option else None

    # Check existing answer
    ca = db.query(CandidateAnswer).filter(
        CandidateAnswer.attempt_id == attempt_id,
        CandidateAnswer.question_id == req.question_id
    ).first()

    if not ca:
        ca = CandidateAnswer(
            attempt_id=attempt_id,
            question_id=req.question_id,
            selected_option=selected
        )
        db.add(ca)
    else:
        ca.selected_option = selected

    db.commit()
    return {"message": "Answer saved successfully", "question_id": req.question_id, "selected_option": selected}

# 5. Submit Exam and Automatically Calculate Marks on Server
@router.post("/attempts/{attempt_id}/submit")
def submit_exam(
    attempt_id: int,
    req: SubmitExamRequest,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    attempt = db.query(ExamAttempt).filter(ExamAttempt.id == attempt_id, ExamAttempt.candidate_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Exam attempt not found")

    if attempt.status == AttemptStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Exam has already been submitted.")

    exam = attempt.exam
    exam_questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).all()
    q_ids = [eq.question_id for eq in exam_questions]
    questions = db.query(Question).filter(Question.id.in_(q_ids)).all()
    q_map = {q.id: q for q in questions}

    saved_answers = db.query(CandidateAnswer).filter(CandidateAnswer.attempt_id == attempt.id).all()
    ans_map = {sa.question_id: sa for sa in saved_answers}

    correct_count = 0
    wrong_count = 0
    unanswered_count = 0
    total_score = 0.0

    for q in questions:
        ans_obj = ans_map.get(q.id)
        if not ans_obj or not ans_obj.selected_option:
            unanswered_count += 1
        else:
            if ans_obj.selected_option.upper() == q.correct_option.upper():
                correct_count += 1
                total_score += float(q.marks)
                ans_obj.is_correct = True
                ans_obj.marks_awarded = q.marks
            else:
                wrong_count += 1
                ans_obj.is_correct = False
                ans_obj.marks_awarded = 0.0

    max_score = float(exam.total_marks)
    score_obtained = total_score
    pct = (score_obtained / max_score * 100.0) if max_score > 0 else 0.0
    is_passed = score_obtained >= float(exam.passing_marks)

    # Update attempt
    attempt.status = AttemptStatus.COMPLETED
    attempt.end_time = datetime.now()
    attempt.duration_spent_seconds = req.duration_spent_seconds

    # Create exam result record
    result = ExamResult(
        attempt_id=attempt.id,
        candidate_id=current_user.id,
        exam_id=exam.id,
        total_questions=len(questions),
        correct_answers=correct_count,
        wrong_answers=wrong_count,
        unanswered=unanswered_count,
        score_obtained=score_obtained,
        max_score=max_score,
        percentage=pct,
        is_passed=is_passed
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    # Run Automatic Job Eligibility Evaluation for all Active Jobs!
    candidate_profile = current_user.candidate_profile
    acad_pct = float(candidate_profile.academic_percentage) if candidate_profile else 0.0
    jobs = db.query(JobPosition).filter(JobPosition.is_active == True).all()

    for job in jobs:
        is_eligible, reason = evaluate_candidate_eligibility(
            job=job,
            academic_percentage=acad_pct,
            exam_score=score_obtained
        )

        # Record or update eligibility
        elig = db.query(EligibilityRecord).filter(
            EligibilityRecord.candidate_id == current_user.id,
            EligibilityRecord.job_id == job.id
        ).first()

        if not elig:
            elig = EligibilityRecord(
                candidate_id=current_user.id,
                job_id=job.id,
                exam_result_id=result.id,
                is_eligible=is_eligible,
                academic_percentage_recorded=acad_pct,
                exam_score_recorded=score_obtained,
                decision_reason=reason
            )
            db.add(elig)
        else:
            elig.exam_result_id = result.id
            elig.is_eligible = is_eligible
            elig.academic_percentage_recorded = acad_pct
            elig.exam_score_recorded = score_obtained
            elig.decision_reason = reason

        # Update candidate's applied application status if any
        app = db.query(Application).filter(
            Application.candidate_id == current_user.id,
            Application.job_id == job.id
        ).first()
        if app:
            app.status = ApplicationStatus.ELIGIBLE if is_eligible else ApplicationStatus.NOT_ELIGIBLE
            app.remarks = reason

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Exam Completed: {exam.title}",
        message=f"You scored {score_obtained}/{max_score} ({pct:.1f}%). Passing status: {'PASSED' if is_passed else 'FAILED'}. Check job eligibility in your dashboard.",
        notification_type="EXAM_RESULT"
    )
    db.add(notif)
    db.commit()

    return {
        "message": "Examination submitted and graded successfully",
        "result_id": result.id,
        "score_obtained": score_obtained,
        "max_score": max_score,
        "percentage": pct,
        "is_passed": is_passed
    }

# 6. Candidate View Results & Past Attempts
@router.get("/results/my-results")
def get_my_results(current_user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    results = db.query(ExamResult).filter(ExamResult.candidate_id == current_user.id).order_by(ExamResult.submitted_at.desc()).all()
    output = []
    for r in results:
        output.append({
            "result_id": r.id,
            "attempt_id": r.attempt_id,
            "exam_id": r.exam_id,
            "exam_title": r.exam.title if r.exam else "-",
            "category": r.exam.category if r.exam else "-",
            "total_questions": r.total_questions,
            "correct_answers": r.correct_answers,
            "wrong_answers": r.wrong_answers,
            "unanswered": r.unanswered,
            "score_obtained": float(r.score_obtained),
            "max_score": float(r.max_score),
            "percentage": float(r.percentage),
            "is_passed": r.is_passed,
            "submitted_at": r.submitted_at
        })
    return output

@router.get("/results/{result_id}/report")
def get_result_report(result_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(ExamResult).filter(ExamResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result report not found")

    # Authorize: Only candidate himself, or HR/ADMIN
    if current_user.role == "CANDIDATE" and result.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view this report")

    cand = result.candidate
    prof = cand.candidate_profile if cand else None

    # Get eligibility records for this candidate
    elig_records = db.query(EligibilityRecord).filter(EligibilityRecord.candidate_id == cand.id).all()
    eligibility_details = [
        {
            "job_title": er.job.title,
            "department": er.job.department,
            "is_eligible": er.is_eligible,
            "decision_reason": er.decision_reason
        } for er in elig_records
    ]

    return {
        "report_id": f"EXAM-REP-{result.id:05d}",
        "candidate": {
            "name": cand.full_name,
            "email": cand.email,
            "phone": cand.phone,
            "qualification": prof.qualification if prof else "-",
            "academic_percentage": float(prof.academic_percentage) if prof else 0.0,
            "centre": prof.allocated_centre.centre_name if (prof and prof.allocated_centre) else "Online Assessment Center"
        },
        "exam": {
            "title": result.exam.title,
            "category": result.exam.category,
            "duration_minutes": result.exam.duration_minutes
        },
        "scores": {
            "total_questions": result.total_questions,
            "correct_answers": result.correct_answers,
            "wrong_answers": result.wrong_answers,
            "unanswered": result.unanswered,
            "score_obtained": float(result.score_obtained),
            "max_score": float(result.max_score),
            "percentage": float(result.percentage),
            "is_passed": result.is_passed
        },
        "eligibility_decisions": eligibility_details,
        "submitted_at": result.submitted_at
    }
