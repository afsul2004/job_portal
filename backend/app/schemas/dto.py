from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# Authentication & User Schemas
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    # Candidate profile fields during registration
    qualification: str
    stream_specialization: Optional[str] = None
    academic_percentage: float = Field(..., ge=0, le=100)
    passing_year: int
    preferred_city_id: Optional[int] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    skills: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserStatusUpdate(BaseModel):
    status: str # APPROVED, REJECTED, ACTIVE, INACTIVE

class CreateHRRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    employee_code: str
    department: str = "Human Resources"
    designation: str = "HR Officer"

# Exam City & Centre Schemas
class ExamCityCreate(BaseModel):
    city_name: str
    state: str

class ExamCentreCreate(BaseModel):
    city_id: int
    centre_name: str
    centre_code: str
    address: str
    total_capacity: int = 100

# Question Schemas
class QuestionCreate(BaseModel):
    category: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str # 'A', 'B', 'C', 'D'
    marks: float = 1.00
    explanation: Optional[str] = None

class QuestionUpdate(BaseModel):
    category: Optional[str] = None
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    marks: Optional[float] = None
    explanation: Optional[str] = None

# Exam Schemas
class ExamCreate(BaseModel):
    title: str
    category: str
    duration_minutes: int = 15
    total_questions: int = 10
    total_marks: float = 10.00
    passing_marks: float = 6.00
    is_published: bool = True
    randomize_questions: bool = True
    instructions: Optional[str] = None
    question_ids: Optional[List[int]] = None

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_questions: Optional[int] = None
    total_marks: Optional[float] = None
    passing_marks: Optional[float] = None
    is_published: Optional[bool] = None
    randomize_questions: Optional[bool] = None
    instructions: Optional[str] = None
    question_ids: Optional[List[int]] = None

# Job Position Schemas
class JobPositionCreate(BaseModel):
    title: str
    department: str
    description: str
    min_academic_percentage: float
    min_exam_score: float
    max_exam_score: Optional[float] = None
    openings_count: int = 5
    is_active: bool = True

class JobPositionUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    min_academic_percentage: Optional[float] = None
    min_exam_score: Optional[float] = None
    max_exam_score: Optional[float] = None
    openings_count: Optional[int] = None
    is_active: Optional[bool] = None

# Exam Taking & Answers Schemas
class SaveAnswerRequest(BaseModel):
    question_id: int
    selected_option: Optional[str] = None # 'A', 'B', 'C', 'D' or None/empty

class SubmitExamRequest(BaseModel):
    duration_spent_seconds: int

# Candidate Profile Update
class CandidateProfileUpdate(BaseModel):
    qualification: Optional[str] = None
    stream_specialization: Optional[str] = None
    academic_percentage: Optional[float] = None
    passing_year: Optional[int] = None
    preferred_city_id: Optional[int] = None
    address: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    skills: Optional[str] = None

# HR Recruitment Actions
class ApplicationStatusUpdate(BaseModel):
    status: str # SHORTLISTED, REJECTED, SELECTED, etc.
    remarks: Optional[str] = None

class CreateEmployeeRecord(BaseModel):
    user_id: int
    employee_id_number: str
    designation: str
    department: str
    joining_date: date
    salary: float = 45000.00
    employment_status: str = "PROBATION"

class UpdateEmployeeRecord(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    employment_status: Optional[str] = None
