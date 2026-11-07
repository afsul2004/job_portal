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

    cursor.execute("USE `job_portal_exam`;")

    # Insert Default Users (Admin and HR only - Candidates register via portal)
    users_data = [
        ("System Administrator", "admin@jobportal.com", admin_pw, "ADMIN", "ACTIVE", "+91 9876543210"),
        ("Sarah Jenkins (HR)", "hr@jobportal.com", hr_pw, "HR", "ACTIVE", "+91 9876543211")
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

    # Insert HR profile
    cursor.execute("""
        INSERT INTO `hr_profiles` (`user_id`, `employee_code`, `department`, `designation`)
        VALUES (%s, 'HR-2026-001', 'Talent Acquisition', 'Lead Recruitment Officer')
    """, (hr_id,))

    # Audit log
    cursor.execute("""
        INSERT INTO `audit_logs` (`performed_by_user_id`, `action`, `details`, `ip_address`)
        VALUES (%s, 'DATABASE_SEED', 'Initial system users (Admin, HR), job roles, examination questions and centres populated.', '127.0.0.1')
    """, (admin_id,))

    print("Admin and HR accounts and system configurations populated successfully!")
    conn.close()

if __name__ == "__main__":
    init_db()
