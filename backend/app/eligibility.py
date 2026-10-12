from decimal import Decimal
from typing import Tuple
from app.models.entities import JobPosition

def evaluate_candidate_eligibility(
    job: JobPosition,
    academic_percentage: float,
    exam_score: float
) -> Tuple[bool, str]:
    """
    Evaluates candidate eligibility based on configurable job criteria.
    Default Rules from Reference Document:
    - Programmer: Score > 8 out of 10 AND aggregate > 75%
    - Data Entry Operator: Score between 6 and 8 out of 10 AND aggregate > 65%
    """
    min_acad = float(job.min_academic_percentage)
    min_score = float(job.min_exam_score)
    max_score = float(job.max_exam_score) if job.max_exam_score is not None else 100.0

    # Check academic requirement
    acad_met = academic_percentage >= min_acad
    # Check exam score requirement (between min_score and max_score inclusive, or > min_score)
    score_met = (exam_score >= min_score) and (exam_score <= max_score)

    if acad_met and score_met:
        reason = (
            f"Eligible for {job.title}. Academic percentage ({academic_percentage:.2f}%) meets threshold "
            f"(>={min_acad:.2f}%) and Exam Score ({exam_score:.2f}) satisfies requirement "
            f"[{min_score:.2f} to {max_score:.2f}]."
        )
        return True, reason
    else:
        reasons = []
        if not acad_met:
            reasons.append(f"Academic aggregate {academic_percentage:.2f}% is below required {min_acad:.2f}%")
        if not score_met:
            reasons.append(f"Exam score {exam_score:.2f} is outside required range [{min_score:.2f} - {max_score:.2f}]")
        
        reason = f"Not Eligible for {job.title}: " + "; ".join(reasons) + "."
        return False, reason
