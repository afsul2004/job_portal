from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean,
    ForeignKey, DateTime, Date, Enum as SQLEnum, func
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CANDIDATE = "CANDIDATE"
    HR = "HR"

class UserStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class GenderEnum(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    TEST_PENDING = "TEST_PENDING"
    TEST_COMPLETED = "TEST_COMPLETED"
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    SELECTED = "SELECTED"

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    DISQUALIFIED = "DISQUALIFIED"

class EmploymentStatus(str, enum.Enum):
    PROBATION = "PROBATION"
    CONFIRMED = "CONFIRMED"
    RESIGNED = "RESIGNED"
    TERMINATED = "TERMINATED"

class NotificationType(str, enum.Enum):
    APPROVAL = "APPROVAL"
    APPLICATION = "APPLICATION"
    EXAM_RESULT = "EXAM_RESULT"
    ELIGIBILITY = "ELIGIBILITY"
    RECRUITMENT = "RECRUITMENT"
    SYSTEM = "SYSTEM"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(191), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hr_profile = relationship("HRProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    employee_record = relationship("EmployeeRecord", back_populates="user", uselist=False, foreign_keys="EmployeeRecord.user_id", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    exam_attempts = relationship("ExamAttempt", back_populates="candidate", cascade="all, delete-orphan")
    exam_results = relationship("ExamResult", back_populates="candidate", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class ExamCity(Base):
    __tablename__ = "exam_cities"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String(100), unique=True, nullable=False)
    state = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    centres = relationship("ExamCentre", back_populates="city", cascade="all, delete-orphan")

class ExamCentre(Base):
    __tablename__ = "exam_centres"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("exam_cities.id", ondelete="CASCADE"), nullable=False)
    centre_name = Column(String(150), nullable=False)
    centre_code = Column(String(50), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    total_capacity = Column(Integer, default=100, nullable=False)
    allocated_seats = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    city = relationship("ExamCity", back_populates="centres")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    qualification = Column(String(100), nullable=False)
    stream_specialization = Column(String(100), nullable=True)
    academic_percentage = Column(Numeric(5, 2), nullable=False)
    passing_year = Column(Integer, nullable=False)
    preferred_city_id = Column(Integer, ForeignKey("exam_cities.id", ondelete="SET NULL"), nullable=True)
    allocated_centre_id = Column(Integer, ForeignKey("exam_centres.id", ondelete="SET NULL"), nullable=True)
    resume_path = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(SQLEnum(GenderEnum), nullable=True)
    skills = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="candidate_profile")
    preferred_city = relationship("ExamCity")
    allocated_centre = relationship("ExamCentre")

class JobPosition(Base):
    __tablename__ = "job_positions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    min_academic_percentage = Column(Numeric(5, 2), nullable=False)
    min_exam_score = Column(Numeric(5, 2), nullable=False)
    max_exam_score = Column(Numeric(5, 2), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    openings_count = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    eligibility_records = relationship("EligibilityRecord", back_populates="job", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, default=15, nullable=False)
    total_questions = Column(Integer, default=10, nullable=False)
    total_marks = Column(Numeric(5, 2), default=10.00, nullable=False)
    passing_marks = Column(Numeric(5, 2), default=6.00, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    randomize_questions = Column(Boolean, default=True, nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    exam_questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_option = Column(String(1), nullable=False) # 'A', 'B', 'C', 'D'
    marks = Column(Numeric(4, 2), default=1.00, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    exam_links = relationship("ExamQuestion", back_populates="question", cascade="all, delete-orphan")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)

    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("Question", back_populates="exam_links")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_positions.id", ondelete="CASCADE"), nullable=False)
    application_date = Column(DateTime, server_default=func.now())
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    candidate = relationship("User", back_populates="applications")
    job = relationship("JobPosition", back_populates="applications")

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(DateTime, server_default=func.now())
    end_time = Column(DateTime, nullable=True)
    duration_spent_seconds = Column(Integer, default=0, nullable=False)
    status = Column(SQLEnum(AttemptStatus), default=AttemptStatus.IN_PROGRESS, nullable=False)
    allow_retake = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    candidate = relationship("User", back_populates="exam_attempts")
    exam = relationship("Exam", back_populates="attempts")
    answers = relationship("CandidateAnswer", back_populates="attempt", cascade="all, delete-orphan")
    result = relationship("ExamResult", back_populates="attempt", uselist=False, cascade="all, delete-orphan")

class CandidateAnswer(Base):
    __tablename__ = "candidate_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_option = Column(String(1), nullable=True) # 'A', 'B', 'C', 'D'
    is_correct = Column(Boolean, default=False, nullable=False)
    marks_awarded = Column(Numeric(4, 2), default=0.00, nullable=False)
    saved_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    attempt = relationship("ExamAttempt", back_populates="answers")
    question = relationship("Question")

class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("exam_attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, default=0, nullable=False)
    wrong_answers = Column(Integer, default=0, nullable=False)
    unanswered = Column(Integer, default=0, nullable=False)
    score_obtained = Column(Numeric(5, 2), default=0.00, nullable=False)
    max_score = Column(Numeric(5, 2), default=10.00, nullable=False)
    percentage = Column(Numeric(5, 2), default=0.00, nullable=False)
    is_passed = Column(Boolean, default=False, nullable=False)
    submitted_at = Column(DateTime, server_default=func.now())

    attempt = relationship("ExamAttempt", back_populates="result")
    candidate = relationship("User", back_populates="exam_results")
    exam = relationship("Exam")

class HRProfile(Base):
    __tablename__ = "hr_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), default="Human Resources", nullable=False)
    designation = Column(String(100), default="HR Officer", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="hr_profile")

class EligibilityRecord(Base):
    __tablename__ = "eligibility_records"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_positions.id", ondelete="CASCADE"), nullable=False)
    exam_result_id = Column(Integer, ForeignKey("exam_results.id", ondelete="SET NULL"), nullable=True)
    is_eligible = Column(Boolean, nullable=False)
    academic_percentage_recorded = Column(Numeric(5, 2), nullable=False)
    exam_score_recorded = Column(Numeric(5, 2), nullable=False)
    decision_reason = Column(Text, nullable=False)
    evaluated_at = Column(DateTime, server_default=func.now())

    candidate = relationship("User")
    job = relationship("JobPosition", back_populates="eligibility_records")
    exam_result = relationship("ExamResult")

class EmployeeRecord(Base):
    __tablename__ = "employee_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id_number = Column(String(50), unique=True, nullable=False)
    designation = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    joining_date = Column(Date, nullable=False)
    salary = Column(Numeric(10, 2), default=45000.00, nullable=False)
    employment_status = Column(SQLEnum(EmploymentStatus), default=EmploymentStatus.PROBATION, nullable=False)
    created_by_hr_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="employee_record")
    created_by_hr = relationship("User", foreign_keys=[created_by_hr_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    performed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    performed_by = relationship("User")
