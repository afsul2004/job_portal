import logging
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.entities import (
    User, UserRole, UserStatus, GenderEnum, ApplicationStatus,
    ExamCity, ExamCentre, JobPosition, Exam, Question, ExamQuestion,
    HRProfile, CandidateProfile, Application, Notification, AuditLog
)
from app.auth import get_password_hash

logger = logging.getLogger("seeder")

def init_and_seed_db():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if already seeded
        admin_user = db.query(User).filter(User.email == "admin@jobportal.com").first()
        if admin_user:
            logger.info("Database already seeded.")
            return

        logger.info("Seeding initial data for Job Portal...")

        # 1. Cities
        chennai = ExamCity(city_name="Chennai", state="Tamil Nadu")
        bangalore = ExamCity(city_name="Bangalore", state="Karnataka")
        hyderabad = ExamCity(city_name="Hyderabad", state="Telangana")
        mumbai = ExamCity(city_name="Mumbai", state="Maharashtra")
        delhi = ExamCity(city_name="Delhi NCR", state="Delhi")
        db.add_all([chennai, bangalore, hyderabad, mumbai, delhi])
        db.flush()

        # 2. Centres
        centres = [
            ExamCentre(city_id=chennai.id, centre_name="Anna University Digital Testing Centre", centre_code="CHN-001", address="Guindy, Chennai - 600025", total_capacity=120, allocated_seats=15),
            ExamCentre(city_id=chennai.id, centre_name="Tidel Tech Assessment Hub", centre_code="CHN-002", address="Taramani, Chennai - 600113", total_capacity=100, allocated_seats=20),
            ExamCentre(city_id=bangalore.id, centre_name="Koramangala Tech Testing Ground", centre_code="BLR-001", address="80 Feet Road, Koramangala 4th Block, Bengaluru", total_capacity=150, allocated_seats=30),
            ExamCentre(city_id=hyderabad.id, centre_name="HITEC City Online Exam Centre", centre_code="HYD-001", address="Madhapur, HITEC City, Hyderabad", total_capacity=140, allocated_seats=25),
            ExamCentre(city_id=mumbai.id, centre_name="Bandra Kurla Examination Complex", centre_code="MUM-001", address="BKC Complex, Bandra East, Mumbai", total_capacity=110, allocated_seats=18),
        ]
        db.add_all(centres)
        db.flush()

        # 3. Job Positions
        job1 = JobPosition(
            title="Programmer",
            department="Software Development",
            description="Responsible for core software design, web application development, algorithms, and database programming.",
            min_academic_percentage=75.00,
            min_exam_score=8.01,
            max_exam_score=10.00,
            openings_count=8,
            is_active=True
        )
        job2 = JobPosition(
            title="Data Entry Operator",
            department="Operations & Records",
            description="Responsible for digital data processing, verification, document digitization, and database record keeping.",
            min_academic_percentage=65.00,
            min_exam_score=6.00,
            max_exam_score=8.00,
            openings_count=12,
            is_active=True
        )
        job3 = JobPosition(
            title="Junior System Analyst",
            department="IT Infrastructure",
            description="Assists senior engineers with server health monitoring, network diagnostic reports, and software test cycles.",
            min_academic_percentage=70.00,
            min_exam_score=7.00,
            max_exam_score=10.00,
            openings_count=5,
            is_active=True
        )
        db.add_all([job1, job2, job3])
        db.flush()

        # 4. Exam & Questions
        exam = Exam(
            title="Technical & Aptitude Assessment 2026",
            category="Computer Science & Aptitude",
            duration_minutes=15,
            total_questions=10,
            total_marks=10.00,
            passing_marks=6.00,
            is_published=True,
            randomize_questions=True,
            instructions="1. 10 MCQs (1 mark each).\n2. Max duration is 15 minutes.\n3. Programmer: Score > 8 and Academics > 75%.\n4. Data Entry Operator: Score 6 to 8 and Academics > 65%."
        )
        db.add(exam)
        db.flush()

        questions_data = [
            ("Computer Science", "What does REST stand for in web API architecture?", "Representational State Transfer", "Remote Execution Server Tool", "Relational Entity Storage Type", "Rapid Enterprise System Transaction", "A", 1.0, "REST stands for Representational State Transfer."),
            ("Computer Science", "Which SQL statement is used to remove a table and its structure from a database?", "DROP TABLE", "DELETE TABLE", "TRUNCATE TABLE", "REMOVE TABLE", "A", 1.0, "DROP TABLE removes both table structure and records."),
            ("Computer Science", "In Python, which built-in data type is immutable?", "List", "Tuple", "Dictionary", "Set", "B", 1.0, "Tuples cannot be mutated after definition."),
            ("Computer Science", "What is the primary role of an index in a relational database?", "To speed up data retrieval operations", "To encrypt stored records", "To prevent duplicate database schemas", "To automatically compress table files", "A", 1.0, "Indexes accelerate query execution."),
            ("Computer Science", "Which HTTP status code signifies that a resource was successfully created?", "200 OK", "201 Created", "204 No Content", "302 Found", "B", 1.0, "201 Created signifies success."),
            ("Computer Science", "Which component in React is used to manage side effects such as data fetching?", "useState", "useEffect", "useReducer", "useRef", "B", 1.0, "useEffect handles lifecycle and side-effects."),
            ("Aptitude", "If 5 workers complete a software project in 12 days, how many days will 6 workers take at the same speed?", "10 days", "8 days", "14 days", "11 days", "A", 1.0, "60 / 6 = 10 days."),
            ("Computer Science", "What does ACID stand for in Database Management Systems?", "Atomicity, Consistency, Isolation, Durability", "Accuracy, Concurrency, Integrity, Durability", "Atomicity, Control, Indexing, Directness", "Algorithm, Computation, Interface, Driver", "A", 1.0, "ACID properties govern transaction safety."),
            ("Computer Science", "Which command is used to display the first elements of a list in JavaScript without modifying it?", "slice()", "splice()", "push()", "pop()", "A", 1.0, "slice() does not mutate."),
            ("Aptitude", "Find the missing number in the series: 3, 9, 27, 81, ?", "162", "243", "216", "324", "B", 1.0, "81 * 3 = 243.")
        ]

        for q in questions_data:
            question_obj = Question(
                category=q[0],
                question_text=q[1],
                option_a=q[2],
                option_b=q[3],
                option_c=q[4],
                option_d=q[5],
                correct_option=q[6],
                marks=q[7],
                explanation=q[8]
            )
            db.add(question_obj)
            db.flush()
            db.add(ExamQuestion(exam_id=exam.id, question_id=question_obj.id))

        # 5. Default Users (Admin and HR only - Candidates register via portal)
        admin_user = User(
            full_name="System Administrator",
            email="admin@jobportal.com",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            phone="+91 9876543210"
        )
        hr_user = User(
            full_name="Sarah Jenkins (HR)",
            email="hr@jobportal.com",
            password_hash=get_password_hash("Hr@123"),
            role=UserRole.HR,
            status=UserStatus.ACTIVE,
            phone="+91 9876543211"
        )
        db.add_all([admin_user, hr_user])
        db.flush()

        # 6. HR Profile
        hr_prof = HRProfile(
            user_id=hr_user.id,
            employee_code="HR-2026-001",
            department="Talent Acquisition",
            designation="Lead Recruitment Officer"
        )
        db.add(hr_prof)

        # 7. Audit Log
        audit = AuditLog(
            performed_by_user_id=admin_user.id,
            action="DATABASE_SEED",
            details="Initial system Admin, HR officer, job positions, questions, and centres populated.",
            ip_address="127.0.0.1"
        )
        db.add(audit)

        db.commit()
        logger.info("Database seeding finished successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()
