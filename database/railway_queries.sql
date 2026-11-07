-- =====================================================================
-- JOB PORTAL: RAILWAY MYSQL DATABASE INSERT QUERIES
-- Connection: mysql://root:rBocBPvjvxndEFQpFmlHRYGhIXoJwAoZ@maglev.proxy.rlwy.net:46607/railway
-- =====================================================================

USE `railway`;

-- 1. Insert System Users (Admin, HR, and Pre-configured Candidates)
-- Passwords:
-- Admin@123      -> $2b$12$KSnHARfc5C.D7Ul6EPg79OiLO2NhWwza3HtGq/tJcrdAAisRjtu7e
-- Hr@123         -> $2b$12$QMFI0dd.9.cXRF8.3yKeIOVjMw.RnVy7gSRtKbY/W73yYoaxRdWOG
-- Afsal123       -> $2b$12$q7X4974AHJMm/OR0eq4e9e/fqQp7NxGcNd0KxaQrpdYmwI6FSYwxa
-- Nafil123       -> $2b$12$cP7ypYKJAUzUlCMdxH/.YOmEc0mJsF3gwpEsbU0/pcgQaRz0nKepW
-- Dhine123       -> $2b$12$eD/ULeKhbY7vmI4UQ4d0ceg3KmjOa7g.Xc5frZN174aIYzuI3iO5C

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `status`, `phone`) VALUES
(1, 'System Administrator', 'admin@jobportal.com', '$2b$12$KSnHARfc5C.D7Ul6EPg79OiLO2NhWwza3HtGq/tJcrdAAisRjtu7e', 'ADMIN', 'ACTIVE', '+91 9876543210'),
(2, 'Sarah Jenkins (HR)', 'hr@jobportal.com', '$2b$12$QMFI0dd.9.cXRF8.3yKeIOVjMw.RnVy7gSRtKbY/W73yYoaxRdWOG', 'HR', 'ACTIVE', '+91 9876543211'),
(3, 'Afsaldeen', 'afsal123@gmail.com', '$2b$12$q7X4974AHJMm/OR0eq4e9e/fqQp7NxGcNd0KxaQrpdYmwI6FSYwxa', 'CANDIDATE', 'APPROVED', '+91 9876543201'),
(4, 'Nafeel', 'nafil123@gmail.com', '$2b$12$cP7ypYKJAUzUlCMdxH/.YOmEc0mJsF3gwpEsbU0/pcgQaRz0nKepW', 'CANDIDATE', 'APPROVED', '+91 9876543202'),
(5, 'Dhina', 'dhina123@gmail.com', '$2b$12$eD/ULeKhbY7vmI4UQ4d0ceg3KmjOa7g.Xc5frZN174aIYzuI3iO5C', 'CANDIDATE', 'APPROVED', '+91 9876543203')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `password_hash` = VALUES(`password_hash`), `status` = VALUES(`status`);

-- 2. Insert HR Profile
INSERT INTO `hr_profiles` (`user_id`, `employee_code`, `department`, `designation`) VALUES
(2, 'HR-2026-001', 'Talent Acquisition', 'Lead Recruitment Officer')
ON DUPLICATE KEY UPDATE `designation` = VALUES(`designation`);

-- 3. Insert Candidate Profiles (Linked to Users 3, 4, 5)
INSERT INTO `candidate_profiles` 
(`user_id`, `qualification`, `stream_specialization`, `academic_percentage`, `passing_year`, `preferred_city_id`, `allocated_centre_id`, `address`, `gender`, `skills`) VALUES
(3, 'B.Tech / B.E', 'Computer Science and Engineering', 85.00, 2025, 1, 1, 'Flat 402, Anna Nagar, Chennai', 'MALE', 'Python, React, MySQL, FastAPI, Data Structures'),
(4, 'B.Com / B.Sc', 'Information Systems', 78.00, 2024, 2, 3, '12th Main Road, Indiranagar, Bengaluru', 'MALE', 'Typing 50wpm, MS Excel, Database entry, Documentation'),
(5, 'B.Tech', 'Information Technology', 72.00, 2025, 3, 4, '24 Gandhi Street, HITEC City, Hyderabad', 'MALE', 'Java, Web Development, MySQL, Problem Solving')
ON DUPLICATE KEY UPDATE `academic_percentage` = VALUES(`academic_percentage`);

-- 4. Initial Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `notification_type`) VALUES
(3, 'Registration Complete', 'Welcome Afsaldeen! Your account is active. You can now access online assessments and job positions.', 'APPROVAL'),
(4, 'Registration Complete', 'Welcome Nafeel! Your account is active. You can now access online assessments and job positions.', 'APPROVAL'),
(5, 'Registration Complete', 'Welcome Dhina! Your account is active. You can now access online assessments and job positions.', 'APPROVAL');
