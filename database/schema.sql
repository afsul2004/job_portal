-- =====================================================================
-- JOB PORTAL BASED ON ONLINE EXAMINATION SYSTEM
-- Complete Normalized MySQL Schema & Comprehensive Initial Seed Data
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `job_portal_exam` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `job_portal_exam`;

-- Disable foreign key checks for clean teardown if rerunning
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `eligibility_records`;
DROP TABLE IF EXISTS `employee_records`;
DROP TABLE IF EXISTS `hr_profiles`;
DROP TABLE IF EXISTS `exam_centres`;
DROP TABLE IF EXISTS `exam_cities`;
DROP TABLE IF EXISTS `candidate_answers`;
DROP TABLE IF EXISTS `exam_results`;
DROP TABLE IF EXISTS `exam_attempts`;
DROP TABLE IF EXISTS `exam_questions`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `job_positions`;
DROP TABLE IF EXISTS `candidate_profiles`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE (Admin, Candidate, HR)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'CANDIDATE', 'HR') NOT NULL DEFAULT 'CANDIDATE',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role_status` (`role`, `status`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. EXAM CITIES
CREATE TABLE `exam_cities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `city_name` VARCHAR(100) NOT NULL UNIQUE,
    `state` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. EXAM CENTRES
CREATE TABLE `exam_centres` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `city_id` INT NOT NULL,
    `centre_name` VARCHAR(150) NOT NULL,
    `centre_code` VARCHAR(50) NOT NULL UNIQUE,
    `address` TEXT NOT NULL,
    `total_capacity` INT NOT NULL DEFAULT 100,
    `allocated_seats` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`city_id`) REFERENCES `exam_cities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CANDIDATE PROFILES
CREATE TABLE `candidate_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `qualification` VARCHAR(100) NOT NULL,
    `stream_specialization` VARCHAR(100) NULL,
    `academic_percentage` DECIMAL(5,2) NOT NULL,
    `passing_year` INT NOT NULL,
    `preferred_city_id` INT NULL,
    `allocated_centre_id` INT NULL,
    `resume_path` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `dob` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `skills` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`preferred_city_id`) REFERENCES `exam_cities`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`allocated_centre_id`) REFERENCES `exam_centres`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. JOB POSITIONS & CONFIGURABLE ELIGIBILITY
CREATE TABLE `job_positions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL UNIQUE,
    `department` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `min_academic_percentage` DECIMAL(5,2) NOT NULL,
    `min_exam_score` DECIMAL(5,2) NOT NULL,
    `max_exam_score` DECIMAL(5,2) NULL, -- Optional upper bound (e.g. for Data Entry Operator 6-8)
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `openings_count` INT NOT NULL DEFAULT 5,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. EXAMS
CREATE TABLE `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `duration_minutes` INT NOT NULL DEFAULT 15,
    `total_questions` INT NOT NULL DEFAULT 10,
    `total_marks` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    `passing_marks` DECIMAL(5,2) NOT NULL DEFAULT 6.00,
    `is_published` BOOLEAN NOT NULL DEFAULT TRUE,
    `randomize_questions` BOOLEAN NOT NULL DEFAULT TRUE,
    `instructions` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QUESTIONS
CREATE TABLE `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(100) NOT NULL,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) NOT NULL,
    `option_d` VARCHAR(255) NOT NULL,
    `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `marks` DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    `explanation` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_questions_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EXAM QUESTIONS (M:N link between Exams and Questions)
CREATE TABLE `exam_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uq_exam_question` (`exam_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. APPLICATIONS (Candidate Applying for a Job)
CREATE TABLE `applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `candidate_id` INT NOT NULL, -- references users.id
    `job_id` INT NOT NULL,
    `application_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('APPLIED', 'TEST_PENDING', 'TEST_COMPLETED', 'ELIGIBLE', 'NOT_ELIGIBLE', 'SHORTLISTED', 'REJECTED', 'SELECTED') NOT NULL DEFAULT 'APPLIED',
    `remarks` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`job_id`) REFERENCES `job_positions`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uq_candidate_job` (`candidate_id`, `job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. EXAM ATTEMPTS
CREATE TABLE `exam_attempts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `candidate_id` INT NOT NULL,
    `exam_id` INT NOT NULL,
    `application_id` INT NULL,
    `start_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `end_time` TIMESTAMP NULL,
    `duration_spent_seconds` INT NOT NULL DEFAULT 0,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'DISQUALIFIED') NOT NULL DEFAULT 'IN_PROGRESS',
    `allow_retake` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL,
    INDEX `idx_attempts_candidate_exam` (`candidate_id`, `exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CANDIDATE ANSWERS
CREATE TABLE `candidate_answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `selected_option` ENUM('A', 'B', 'C', 'D') NULL,
    `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
    `marks_awarded` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    `saved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uq_attempt_question` (`attempt_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. EXAM RESULTS
CREATE TABLE `exam_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` INT NOT NULL UNIQUE,
    `candidate_id` INT NOT NULL,
    `exam_id` INT NOT NULL,
    `total_questions` INT NOT NULL,
    `correct_answers` INT NOT NULL DEFAULT 0,
    `wrong_answers` INT NOT NULL DEFAULT 0,
    `unanswered` INT NOT NULL DEFAULT 0,
    `score_obtained` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `max_score` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    `percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `is_passed` BOOLEAN NOT NULL DEFAULT FALSE,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. HR PROFILES
CREATE TABLE `hr_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `employee_code` VARCHAR(50) NOT NULL UNIQUE,
    `department` VARCHAR(100) NOT NULL DEFAULT 'Human Resources',
    `designation` VARCHAR(100) NOT NULL DEFAULT 'HR Officer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ELIGIBILITY RECORDS (Rule Engine Decisions)
CREATE TABLE `eligibility_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `candidate_id` INT NOT NULL,
    `job_id` INT NOT NULL,
    `exam_result_id` INT NULL,
    `is_eligible` BOOLEAN NOT NULL,
    `academic_percentage_recorded` DECIMAL(5,2) NOT NULL,
    `exam_score_recorded` DECIMAL(5,2) NOT NULL,
    `decision_reason` TEXT NOT NULL,
    `evaluated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`job_id`) REFERENCES `job_positions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`exam_result_id`) REFERENCES `exam_results`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `uq_candidate_job_eligibility` (`candidate_id`, `job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. EMPLOYEE RECORDS (Final selected candidates converted to Employees)
CREATE TABLE `employee_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `employee_id_number` VARCHAR(50) NOT NULL UNIQUE,
    `designation` VARCHAR(100) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `joining_date` DATE NOT NULL,
    `salary` DECIMAL(10,2) NOT NULL DEFAULT 45000.00,
    `employment_status` ENUM('PROBATION', 'CONFIRMED', 'RESIGNED', 'TERMINATED') NOT NULL DEFAULT 'PROBATION',
    `created_by_hr_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by_hr_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. NOTIFICATIONS
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `notification_type` ENUM('APPROVAL', 'APPLICATION', 'EXAM_RESULT', 'ELIGIBILITY', 'RECRUITMENT', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_notifications_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. AUDIT LOGS
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `performed_by_user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`performed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA (Default Admin, HR, Job Positions, Cities, Centres & Questions)
-- Passwords hashed using bcrypt for "Admin@123", "Hr@123", "Candidate@123"
-- Hashes:
-- $2b$12$e7EskvL0j4f1FzT9bJ2W8.Y3pC6gY6eK7JkW5E0L0O0A.qA0G41mS or generated via script
-- =====================================================================

-- Default Cities
INSERT INTO `exam_cities` (`id`, `city_name`, `state`) VALUES
(1, 'Chennai', 'Tamil Nadu'),
(2, 'Bangalore', 'Karnataka'),
(3, 'Hyderabad', 'Telangana'),
(4, 'Mumbai', 'Maharashtra'),
(5, 'Delhi NCR', 'Delhi');

-- Default Centres
INSERT INTO `exam_centres` (`id`, `city_id`, `centre_name`, `centre_code`, `address`, `total_capacity`, `allocated_seats`) VALUES
(1, 1, 'Anna University Digital Testing Centre', 'CHN-001', 'Guindy, Chennai - 600025', 120, 15),
(2, 1, 'Tidel Tech Assessment Hub', 'CHN-002', 'Taramani, Chennai - 600113', 100, 20),
(3, 2, 'Koramangala Tech Testing Ground', 'BLR-001', '80 Feet Road, Koramangala 4th Block, Bengaluru', 150, 30),
(4, 3, 'HITEC City Online Exam Centre', 'HYD-001', 'Madhapur, HITEC City, Hyderabad', 140, 25),
(5, 4, 'Bandra Kurla Examination Complex', 'MUM-001', 'BKC Complex, Bandra East, Mumbai', 110, 18);

-- Default Job Positions with Project Document Rules:
-- Programmer: Score > 8 out of 10 AND Aggregate > 75%
-- Data Entry Operator: Score between 6 and 8 out of 10 AND Aggregate > 65%
INSERT INTO `job_positions` (`id`, `title`, `department`, `description`, `min_academic_percentage`, `min_exam_score`, `max_exam_score`, `is_active`, `openings_count`) VALUES
(1, 'Programmer', 'Software Development', 'Responsible for core software design, web application development, algorithms, and database programming.', 75.00, 8.01, 10.00, TRUE, 8),
(2, 'Data Entry Operator', 'Operations & Records', 'Responsible for digital data processing, verification, document digitization, and database record keeping.', 65.00, 6.00, 8.00, TRUE, 12),
(3, 'Junior System Analyst', 'IT Infrastructure', 'Assists senior engineers with server health monitoring, network diagnostic reports, and software test cycles.', 70.00, 7.00, 10.00, TRUE, 5);

-- Default Exam Configuration
INSERT INTO `exams` (`id`, `title`, `category`, `duration_minutes`, `total_questions`, `total_marks`, `passing_marks`, `is_published`, `randomize_questions`, `instructions`) VALUES
(1, 'Technical & Aptitude Assessment 2026', 'Computer Science & Aptitude', 15, 10, 10.00, 6.00, TRUE, TRUE, 
'1. This exam contains 10 Multiple Choice Questions (1 mark each).\n2. Maximum duration is 15 minutes.\n3. The exam will automatically submit when time expires.\n4. Programmer role requires a score greater than 8 out of 10 with > 75% academics.\n5. Data Entry Operator requires a score of 6 to 8 with > 65% academics.\n6. Do not refresh or close the browser during the examination.');

-- 15 Standard Multiple Choice Questions
INSERT INTO `questions` (`id`, `category`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `marks`, `explanation`) VALUES
(1, 'Computer Science', 'What does REST stand for in web API architecture?', 'Representational State Transfer', 'Remote Execution Server Tool', 'Relational Entity Storage Type', 'Rapid Enterprise System Transaction', 'A', 1.00, 'REST stands for Representational State Transfer, an architectural style for distributed hypermedia systems.'),
(2, 'Computer Science', 'Which SQL statement is used to remove a table and its structure from a database?', 'DROP TABLE', 'DELETE TABLE', 'TRUNCATE TABLE', 'REMOVE TABLE', 'A', 1.00, 'DROP TABLE removes both data and the table schema definition.'),
(3, 'Computer Science', 'In Python, which built-in data type is immutable?', 'List', 'Tuple', 'Dictionary', 'Set', 'B', 1.00, 'Tuples cannot be modified after their creation.'),
(4, 'Computer Science', 'What is the primary role of an index in a relational database?', 'To speed up data retrieval operations', 'To encrypt stored records', 'To prevent duplicate database schemas', 'To automatically compress table files', 'A', 1.00, 'Indexes accelerate search and lookup queries on designated columns.'),
(5, 'Computer Science', 'Which HTTP status code signifies that a resource was successfully created?', '200 OK', '201 Created', '204 No Content', '302 Found', 'B', 1.00, 'HTTP 201 Created signifies successful resource creation.'),
(6, 'Computer Science', 'Which component in React is used to manage side effects such as data fetching?', 'useState', 'useEffect', 'useReducer', 'useRef', 'B', 1.00, 'useEffect handles side-effects like API calls, listeners, and manual DOM mutations.'),
(7, 'Aptitude', 'If 5 workers complete a software project in 12 days, how many days will 6 workers take at the same speed?', '10 days', '8 days', '14 days', '11 days', 'A', 1.00, 'Total work = 5 * 12 = 60 person-days. Time for 6 workers = 60 / 6 = 10 days.'),
(8, 'Computer Science', 'What does ACID stand for in Database Management Systems?', 'Atomicity, Consistency, Isolation, Durability', 'Accuracy, Concurrency, Integrity, Durability', 'Atomicity, Control, Indexing, Directness', 'Algorithm, Computation, Interface, Driver', 'A', 1.00, 'ACID transactions guarantee reliable processing in databases.'),
(9, 'Computer Science', 'Which command is used to display the first elements of a list in JavaScript without modifying it?', 'slice()', 'splice()', 'push()', 'pop()', 'A', 1.00, 'slice() returns a shallow copy of a portion of an array without mutating the original.'),
(10, 'Aptitude', 'Find the missing number in the series: 3, 9, 27, 81, ?', '162', '243', '216', '324', 'B', 1.00, 'Each term is multiplied by 3. 81 * 3 = 243.'),
(11, 'Computer Science', 'Which normal form eliminates partial dependency on a composite candidate key?', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF', 'B', 1.00, '2NF removes partial dependency of non-prime attributes on candidate keys.'),
(12, 'Computer Science', 'Which Python keyword is used to handle exceptions?', 'try / except', 'do / catch', 'begin / rescue', 'try / trap', 'A', 1.00, 'Python uses try and except blocks for structured exception handling.'),
(13, 'Computer Science', 'What is the purpose of JWT (JSON Web Token)?', 'Secure transmission of information between parties as a JSON object', 'Compiling JavaScript to machine bytecode', 'Rendering responsive web graphics', 'Optimizing database query execution plans', 'A', 1.00, 'JWT securely transmits verified claims and user sessions.'),
(14, 'Aptitude', 'A train running at 72 km/h crosses a pole in 9 seconds. What is the length of the train?', '180 meters', '200 meters', '150 meters', '220 meters', 'A', 1.00, 'Speed = 72 * (5/18) = 20 m/s. Length = Speed * Time = 20 * 9 = 180 meters.'),
(15, 'Computer Science', 'In MySQL, what is the default port number?', '3306', '5432', '8080', '1433', 'A', 1.00, 'MySQL default TCP port is 3306.');

-- Associate First 10 Questions to Exam 1
INSERT INTO `exam_questions` (`exam_id`, `question_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);
