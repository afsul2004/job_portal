import pymysql
import os
import bcrypt

def get_password_hash(password: str) -> str:
    # Use standard bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def init_db():
    print("Connecting to MySQL...")
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="root",
        port=3306,
        autocommit=True
    )
    cursor = conn.cursor()

    # Read schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql_commands = f.read().split(";")

    print("Executing schema.sql statements...")
    for cmd in sql_commands:
        stmt = cmd.strip()
        if stmt:
            cursor.execute(stmt)

    print("Schema created successfully!")

    # Now insert default hashed users:
    admin_pw = get_password_hash("Admin@123")
    hr_pw = get_password_hash("Hr@123")
    cand1_pw = get_password_hash("Candidate@123")
    cand2_pw = get_password_hash("Candidate@123")
    cand3_pw = get_password_hash("Candidate@123")

    cursor.execute("USE `job_portal_exam`;")

    # Insert Users
    users_data = [
        ("System Administrator", "admin@jobportal.com", admin_pw, "ADMIN", "ACTIVE", "+91 9876543210"),
        ("Sarah Jenkins (HR)", "hr@jobportal.com", hr_pw, "HR", "ACTIVE", "+91 9876543211"),
        ("Rahul Sharma (Programmer Candidate)", "rahul@example.com", cand1_pw, "CANDIDATE", "APPROVED", "+91 9876543212"),
        ("Priya Patel (Data Entry Candidate)", "priya@example.com", cand2_pw, "CANDIDATE", "APPROVED", "+91 9876543213"),
        ("Amit Kumar (New Candidate)", "amit@example.com", cand3_pw, "CANDIDATE", "PENDING", "+91 9876543214")
    ]

    for u in users_data:
        cursor.execute("""
            INSERT INTO `users` (`full_name`, `email`, `password_hash`, `role`, `status`, `phone`)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, u)

    # Fetch inserted user IDs
    cursor.execute("SELECT id, email, role FROM `users`;")
    user_map = {row[1]: row[0] for row in cursor.fetchall()}

    admin_id = user_map["admin@jobportal.com"]
    hr_id = user_map["hr@jobportal.com"]
    rahul_id = user_map["rahul@example.com"]
    priya_id = user_map["priya@example.com"]
    amit_id = user_map["amit@example.com"]

    # Insert HR profile
    cursor.execute("""
        INSERT INTO `hr_profiles` (`user_id`, `employee_code`, `department`, `designation`)
        VALUES (%s, 'HR-2026-001', 'Talent Acquisition', 'Lead Recruitment Officer')
    """, (hr_id,))

    # Insert Candidate Profiles
    cursor.execute("""
        INSERT INTO `candidate_profiles` 
        (`user_id`, `qualification`, `stream_specialization`, `academic_percentage`, `passing_year`, `preferred_city_id`, `allocated_centre_id`, `address`, `dob`, `gender`, `skills`)
        VALUES 
        (%s, 'B.Tech / B.E', 'Computer Science and Engineering', 82.50, 2025, 1, 1, 'Flat 402, Anna Nagar, Chennai', '2003-05-14', 'MALE', 'Python, React, MySQL, FastAPI, Data Structures'),
        (%s, 'B.Com / B.Sc', 'Information Systems', 71.00, 2024, 2, 3, '12th Main Road, Indiranagar, Bengaluru', '2002-11-20', 'FEMALE', 'Typing 50wpm, MS Excel, Database entry, Documentation'),
        (%s, 'B.Tech', 'Information Technology', 68.00, 2025, 1, 2, '24 Gandhi Street, Tambaram, Chennai', '2003-02-10', 'MALE', 'Basic Java, HTML, Office Tools')
    """, (rahul_id, priya_id, amit_id))

    # Candidate applications
    cursor.execute("""
        INSERT INTO `applications` (`candidate_id`, `job_id`, `status`, `remarks`)
        VALUES 
        (%s, 1, 'TEST_COMPLETED', 'Applied for Programmer. High academic aggregate.'),
        (%s, 2, 'TEST_COMPLETED', 'Applied for Data Entry Operator.')
    """, (rahul_id, priya_id))

    # Notifications
    cursor.execute("""
        INSERT INTO `notifications` (`user_id`, `title`, `message`, `notification_type`)
        VALUES
        (%s, 'Registration Approved', 'Welcome Rahul! Your registration has been approved by the Admin. You can now take online exams and apply for jobs.', 'APPROVAL'),
        (%s, 'Registration Approved', 'Welcome Priya! Your registration has been approved. You may proceed to your online assessment.', 'APPROVAL'),
        (%s, 'Pending Verification', 'Your profile registration is currently pending admin review.', 'SYSTEM')
    """, (rahul_id, priya_id, amit_id))

    # Audit log
    cursor.execute("""
        INSERT INTO `audit_logs` (`performed_by_user_id`, `action`, `details`, `ip_address`)
        VALUES (%s, 'DATABASE_SEED', 'Initial system users, job roles, examination questions and centres populated.', '127.0.0.1')
    """, (admin_id,))

    print("All seed users, candidate profiles, and configurations inserted successfully!")
    conn.close()

if __name__ == "__main__":
    init_db()
