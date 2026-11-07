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
    cand1_pw = get_password_hash("Afsal123")
    cand2_pw = get_password_hash("Nafil123")
    cand3_pw = get_password_hash("Dhine123")

    cursor.execute("USE `job_portal_exam`;")

    # Insert Users
    users_data = [
        ("System Administrator", "admin@jobportal.com", admin_pw, "ADMIN", "ACTIVE", "+91 9876543210"),
        ("Sarah Jenkins (HR)", "hr@jobportal.com", hr_pw, "HR", "ACTIVE", "+91 9876543211"),
        ("Afsaldeen", "afsal123@gmail.com", cand1_pw, "CANDIDATE", "APPROVED", "+91 9876543201"),
        ("Nafeel", "nafil123@gmail.com", cand2_pw, "CANDIDATE", "APPROVED", "+91 9876543202"),
        ("Dhina", "dhina123@gmail.com", cand3_pw, "CANDIDATE", "APPROVED", "+91 9876543203")
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
    cand1_id = user_map["afsal123@gmail.com"]
    cand2_id = user_map["nafil123@gmail.com"]
    cand3_id = user_map["dhina123@gmail.com"]

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
        (%s, 'B.Tech / B.E', 'Computer Science and Engineering', 85.00, 2025, 1, 1, 'Flat 402, Anna Nagar, Chennai', '2003-05-14', 'MALE', 'Python, React, MySQL, FastAPI, Data Structures'),
        (%s, 'B.Com / B.Sc', 'Information Systems', 78.00, 2024, 2, 3, '12th Main Road, Indiranagar, Bengaluru', '2002-11-20', 'MALE', 'Typing 50wpm, MS Excel, Database entry, Documentation'),
        (%s, 'B.Tech', 'Information Technology', 72.00, 2025, 3, 4, '24 Gandhi Street, HITEC City, Hyderabad', '2003-02-10', 'MALE', 'Java, Web Development, MySQL, Problem Solving')
    """, (cand1_id, cand2_id, cand3_id))

    # Candidate applications
    cursor.execute("""
        INSERT INTO `applications` (`candidate_id`, `job_id`, `status`, `remarks`)
        VALUES 
        (%s, 1, 'APPLIED', 'Applied for Programmer position.'),
        (%s, 2, 'APPLIED', 'Applied for Data Entry Operator position.'),
        (%s, 1, 'APPLIED', 'Applied for Programmer position.')
    """, (cand1_id, cand2_id, cand3_id))

    # Notifications
    cursor.execute("""
        INSERT INTO `notifications` (`user_id`, `title`, `message`, `notification_type`)
        VALUES
        (%s, 'Registration Approved', 'Welcome Afsaldeen! Your registration has been approved.', 'APPROVAL'),
        (%s, 'Registration Approved', 'Welcome Nafeel! Your registration has been approved.', 'APPROVAL'),
        (%s, 'Registration Approved', 'Welcome Dhina! Your registration has been approved.', 'APPROVAL')
    """, (cand1_id, cand2_id, cand3_id))

    # Audit log
    cursor.execute("""
        INSERT INTO `audit_logs` (`performed_by_user_id`, `action`, `details`, `ip_address`)
        VALUES (%s, 'DATABASE_SEED', 'Initial system users, job roles, examination questions and centres populated.', '127.0.0.1')
    """, (admin_id,))

    print("All seed users, candidate profiles, and configurations inserted successfully!")
    conn.close()

if __name__ == "__main__":
    init_db()
