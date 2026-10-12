# Job Portal Based on Online Examination System

A comprehensive, production-grade full-stack web application built according to the functional requirements of the **“Job Portal Based on Online Exam”** reference project.

---

## 1. Project Architecture & Highlights

- **Frontend:** React 18, Vite, React Router v6, Axios, Lucide Icons, Modern Blue/Slate CSS Design System.
- **Backend:** Python 3.14 with FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, PyMySQL.
- **Database:** MySQL 8.0 normalized database (`job_portal_exam`) across **17 relational tables**.
- **Security:** Bcrypt password hashing, JWT Bearer authentication, server-enforced role-based access control (`ADMIN`, `HR`, `CANDIDATE`), server-side examination timing and grading.

---

## 2. Configurable Job Eligibility Rules (Specification Reference)

The backend implements automated eligibility calculation triggered upon examination submission:

1. **Programmer Position:**
   - **Exam Score:** Score must be **greater than 8 out of 10** (`> 8.0`).
   - **Academics:** Aggregate academic percentage must be **greater than 75%** (`> 75.0%`).
   - *Both conditions must be met for eligibility.*
2. **Data Entry Operator Position:**
   - **Exam Score:** Score must be **between 6 and 8 out of 10** inclusive (`6.0 <= score <= 8.0`).
   - **Academics:** Aggregate academic percentage must be **greater than 65%** (`> 65.0%`).
   - *Both conditions must be met for eligibility.*

---

## 3. Database Schema (`job_portal_exam`)

The system uses 17 normalized tables:
1. `users`: Credentials, roles (`ADMIN`, `HR`, `CANDIDATE`), and account approval statuses.
2. `candidate_profiles`: Qualifications, academic aggregate percentage, passing year, allocated testing centre, and PDF resume path.
3. `job_positions`: Open vacancies and configurable threshold rules (`min_academic_percentage`, `min_exam_score`, `max_exam_score`).
4. `applications`: Candidate applications tracked from `APPLIED` to `ELIGIBLE`, `SHORTLISTED`, and `SELECTED`.
5. `exams`: Assessment configurations (duration, marks, pass criteria, instructions, publication status).
6. `questions`: MCQ question bank with options A–D, correct answer, marks, and explanations.
7. `exam_questions`: M:N association linking questions to specific exams.
8. `exam_attempts`: Candidate session tracking, start time, end time, duration spent, and retake controls.
9. `candidate_answers`: Selected options saved dynamically (auto-save), correctness, and marks awarded.
10. `exam_results`: Server-calculated score, percentage, and pass/fail determination.
11. `exam_cities`: Geographic assessment zones.
12. `exam_centres`: Physical testing hubs with address, total capacity, and allocated seats.
13. `hr_profiles`: HR officer employee codes, designations, and departments.
14. `employee_records`: Final selected candidates onboarded as confirmed corporate staff.
15. `eligibility_records`: Rule-engine evaluated decisions and reasons.
16. `notifications`: Real-time candidate alerts (registration approval, exam scores, recruitment status).
17. `audit_logs`: Audit logs of administrative and recruitment operations.

---

## 4. Default Seed Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@jobportal.com` | `Admin@123` | Full administrative control |
| **HR Recruitment Officer** | `hr@jobportal.com` | `Hr@123` | Candidate review & employee onboarding |
| **Candidate (Programmer)** | `rahul@example.com` | `Candidate@123` | Pre-approved, 82.5% academic aggregate |
| **Candidate (Data Entry)** | `priya@example.com` | `Candidate@123` | Pre-approved, 71.0% academic aggregate |
| **New Candidate** | `amit@example.com` | `Candidate@123` | Pending Admin Approval status |

---

## 5. Local Setup & Execution Guide

### Step 1: Database Setup
1. Ensure MySQL is running on `localhost:3306`.
2. Run the initialization script to create the schema and seed data:
   ```bash
   python database/init_db.py
   ```

### Step 2: Backend Setup & Execution
1. Install requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Interactive Swagger documentation: `http://localhost:8000/docs`

### Step 3: Frontend Setup & Execution
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Launch Vite development server:
   ```bash
   npm run dev
   ```
   Access Web Portal: `http://localhost:5173`

---

## 6. Testing

Run backend tests using Pytest:
```bash
cd backend
python -m pytest tests/test_api.py -v
```
All tests validate authentication, endpoint responses, boundary conditions, and eligibility rules.
