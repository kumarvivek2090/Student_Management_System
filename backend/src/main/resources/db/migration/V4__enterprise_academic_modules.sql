-- ====================================================================
-- STUDENT REPORT SYSTEM - V4 ENTERPRISE ACADEMIC MODULES
-- Neon PostgreSQL Compatible
-- ====================================================================

-- 1. TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50) DEFAULT 'Room 101',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_timetable_slot UNIQUE (class_id, section_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_timetable_class_section ON timetables(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher ON timetables(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetables(day_of_week);

-- 2. ACADEMIC CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('ACADEMIC', 'EXAMINATION', 'HOLIDAY', 'MEETING', 'SPORTS', 'CULTURAL', 'OTHER')),
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(150) DEFAULT 'Oakridge Campus',
    is_published BOOLEAN DEFAULT TRUE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academic_events_dates ON academic_events(start_date, end_date);

-- 3. FEE STRUCTURES
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    due_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENT FEES
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (paid_amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);

-- 5. FEE PAYMENTS
CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_fee_id UUID NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'ONLINE' CHECK (payment_method IN ('ONLINE', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'CARD')),
    transaction_reference VARCHAR(100),
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks NUMERIC(5,2) DEFAULT 100.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_class_section ON assignments(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);

-- 7. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachment_url VARCHAR(500),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED', 'LATE', 'RETURNED')),
    obtained_marks NUMERIC(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

-- 8. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'FAMILY', 'MEDICAL', 'ACADEMIC', 'OTHER')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);

-- 9. LEARNING MATERIALS
CREATE TABLE IF NOT EXISTS learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    file_type VARCHAR(50) DEFAULT 'PDF' CHECK (file_type IN ('PDF', 'DOCUMENT', 'VIDEO', 'LINK', 'SLIDES')),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SYSTEM ACTIVITY LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARN', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ====================================================================
-- SEED ENTERPRISE RECORDS DYNAMICALLY
-- ====================================================================

DO $$
DECLARE
    v_class_id UUID;
    v_section_id UUID;
    v_year_id UUID;
    v_phys_id UUID;
    v_math_id UUID;
    v_cs_id UUID;
    v_eng_id UUID;
    v_teacher1_id UUID;
    v_teacher2_id UUID;
    v_student_id UUID;
    v_admin_user_id UUID;
    v_fee_struct_id UUID;
    v_assignment_id UUID;
BEGIN
    SELECT id INTO v_class_id FROM classes WHERE name = 'Grade 10' LIMIT 1;
    SELECT id INTO v_section_id FROM sections WHERE class_id = v_class_id AND name = 'A' LIMIT 1;
    SELECT id INTO v_year_id FROM academic_years WHERE is_current = TRUE LIMIT 1;
    SELECT id INTO v_phys_id FROM subjects WHERE code = 'PHYS101' LIMIT 1;
    SELECT id INTO v_math_id FROM subjects WHERE code = 'MATH101' LIMIT 1;
    SELECT id INTO v_cs_id FROM subjects WHERE code = 'CS101' LIMIT 1;
    SELECT id INTO v_eng_id FROM subjects WHERE code = 'ENG101' LIMIT 1;
    SELECT id INTO v_teacher1_id FROM teachers LIMIT 1;
    SELECT id INTO v_teacher2_id FROM teachers OFFSET 1 LIMIT 1;
    IF v_teacher2_id IS NULL THEN
        v_teacher2_id := v_teacher1_id;
    END IF;
    SELECT id INTO v_admin_user_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    SELECT id INTO v_student_id FROM students WHERE roll_number = '111' LIMIT 1;
    IF v_student_id IS NULL THEN
        SELECT id INTO v_student_id FROM students LIMIT 1;
    END IF;

    -- 1. SEED TIMETABLES (Monday to Friday Schedule for Grade 10-A)
    IF v_class_id IS NOT NULL AND v_section_id IS NOT NULL AND v_phys_id IS NOT NULL AND v_teacher1_id IS NOT NULL THEN
        INSERT INTO timetables (class_id, section_id, subject_id, teacher_id, academic_year_id, day_of_week, start_time, end_time, room_number)
        VALUES
        (v_class_id, v_section_id, v_math_id, v_teacher1_id, v_year_id, 'MONDAY', '08:30:00', '09:30:00', 'Room 101'),
        (v_class_id, v_section_id, v_phys_id, v_teacher2_id, v_year_id, 'MONDAY', '09:45:00', '10:45:00', 'Physics Lab A'),
        (v_class_id, v_section_id, COALESCE(v_cs_id, v_math_id), v_teacher1_id, v_year_id, 'MONDAY', '11:00:00', '12:00:00', 'Computer Lab 2'),
        (v_class_id, v_section_id, v_math_id, v_teacher1_id, v_year_id, 'TUESDAY', '08:30:00', '09:30:00', 'Room 101'),
        (v_class_id, v_section_id, COALESCE(v_eng_id, v_phys_id), v_teacher2_id, v_year_id, 'TUESDAY', '09:45:00', '10:45:00', 'Room 101'),
        (v_class_id, v_section_id, v_phys_id, v_teacher2_id, v_year_id, 'WEDNESDAY', '08:30:00', '09:30:00', 'Physics Lab A'),
        (v_class_id, v_section_id, v_math_id, v_teacher1_id, v_year_id, 'WEDNESDAY', '09:45:00', '10:45:00', 'Room 101'),
        (v_class_id, v_section_id, COALESCE(v_cs_id, v_phys_id), v_teacher1_id, v_year_id, 'THURSDAY', '08:30:00', '09:30:00', 'Computer Lab 2'),
        (v_class_id, v_section_id, v_phys_id, v_teacher2_id, v_year_id, 'THURSDAY', '09:45:00', '10:45:00', 'Room 101'),
        (v_class_id, v_section_id, v_math_id, v_teacher1_id, v_year_id, 'FRIDAY', '08:30:00', '09:30:00', 'Room 101'),
        (v_class_id, v_section_id, COALESCE(v_eng_id, v_phys_id), v_teacher2_id, v_year_id, 'FRIDAY', '09:45:00', '10:45:00', 'Auditorium')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. SEED ACADEMIC CALENDAR EVENTS
    INSERT INTO academic_events (title, description, event_type, start_date, end_date, start_time, end_time, location)
    VALUES
    ('Fall Term Commencement', 'Official start of Fall Semester 2026 academic calendar.', 'ACADEMIC', '2026-09-01', '2026-09-01', '08:30:00', '15:00:00', 'Main Auditorium'),
    ('Midterm Examination Week', 'Comprehensive mid-term evaluation examinations across all grades.', 'EXAMINATION', '2026-10-12', '2026-10-20', '09:00:00', '12:00:00', 'Exam Halls 1-4'),
    ('Annual Science & Tech Fair', 'Student innovation showcase with interactive science exhibits.', 'CULTURAL', '2026-11-28', '2026-11-29', '10:00:00', '16:00:00', 'Oakridge Quadrangle'),
    ('Parent-Teacher Conference', 'One-on-one academic consultation on student term progress.', 'MEETING', '2026-12-05', '2026-12-05', '09:00:00', '17:00:00', 'Academic Wing'),
    ('Winter Vacation & Recess', 'Institutional winter break closure for students and faculty.', 'HOLIDAY', '2026-12-20', '2027-01-05', NULL, NULL, 'Campus-wide')
    ON CONFLICT DO NOTHING;

    -- 3. SEED FEE STRUCTURE & STUDENT FEES
    IF v_year_id IS NOT NULL AND v_class_id IS NOT NULL THEN
        INSERT INTO fee_structures (academic_year_id, class_id, title, total_amount, due_date, description)
        VALUES (v_year_id, v_class_id, 'Fall 2026 Academic Tuition & Lab Fee', 1250.00, '2026-12-15', 'Standard institutional tuition fee including science laboratory maintenance and digital library access.')
        RETURNING id INTO v_fee_struct_id;

        IF v_student_id IS NOT NULL AND v_fee_struct_id IS NOT NULL THEN
            INSERT INTO student_fees (student_id, fee_structure_id, invoice_number, total_amount, paid_amount, due_date, status, remarks)
            VALUES (v_student_id, v_fee_struct_id, 'INV-2026-1101', 1250.00, 1250.00, '2026-12-15', 'PAID', 'Tuition paid in full online via Student Portal.')
            ON CONFLICT (invoice_number) DO NOTHING;
        END IF;

        -- Seed for Sophia Miller as well if exists
        FOR v_student_id IN (SELECT id FROM students WHERE roll_number = '101' LIMIT 1) LOOP
            INSERT INTO student_fees (student_id, fee_structure_id, invoice_number, total_amount, paid_amount, due_date, status, remarks)
            VALUES (v_student_id, v_fee_struct_id, 'INV-2026-1102', 1250.00, 750.00, '2026-12-15', 'PARTIAL', 'Partial payment received; remaining balance $500.')
            ON CONFLICT (invoice_number) DO NOTHING;
        END LOOP;
    END IF;

    -- 4. SEED ASSIGNMENTS
    IF v_class_id IS NOT NULL AND v_section_id IS NOT NULL AND v_math_id IS NOT NULL AND v_teacher1_id IS NOT NULL THEN
        INSERT INTO assignments (class_id, section_id, subject_id, teacher_id, title, description, due_date, max_marks, status)
        VALUES
        (v_class_id, v_section_id, v_math_id, v_teacher1_id, 'Calculus & Curve Sketching Worksheet', 'Solve questions 1 through 15 from Chapter 4 on derivatives and curve points. Submit step-by-step proofs.', '2026-12-01 23:59:59+00', 50.00, 'ACTIVE'),
        (v_class_id, v_section_id, v_phys_id, v_teacher2_id, 'Thermodynamics & Heat Engine Lab Report', 'Document lab observations, calculate thermodynamic efficiency, and submit experimental findings in report format.', '2026-12-08 23:59:59+00', 100.00, 'ACTIVE')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. SEED LEARNING MATERIALS
    IF v_class_id IS NOT NULL AND v_math_id IS NOT NULL AND v_teacher1_id IS NOT NULL THEN
        INSERT INTO learning_materials (class_id, subject_id, uploaded_by, title, description, file_url, file_type, is_published)
        VALUES
        (v_class_id, v_math_id, v_teacher1_id, 'Advanced Mathematics Syllabus & Lecture Handbook 2026', 'Comprehensive reference syllabus, curriculum topics, and practice questions for Calculus and Algebra.', 'https://oakridge.edu/materials/math-syllabus-2026.pdf', 'PDF', TRUE),
        (v_class_id, v_phys_id, v_teacher2_id, 'Physics Lab Safety & Mechanics Experiment Guide', 'Essential laboratory protocols, safety measures, and mechanics experimental calculation sheets.', 'https://oakridge.edu/materials/physics-lab-guide.pdf', 'PDF', TRUE),
        (v_class_id, v_math_id, v_teacher1_id, 'Calculus Problem Solving Masterclass Slides', 'Lecture slides covering integration techniques, trigonometric substitutions, and practical physics applications.', 'https://oakridge.edu/materials/calculus-masterclass.pdf', 'SLIDES', TRUE)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. SEED LEAVE REQUESTS
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO leave_requests (user_id, role, leave_type, start_date, end_date, reason, status, reviewer_remarks)
        VALUES
        (v_admin_user_id, 'ADMIN', 'ACADEMIC', '2026-12-10', '2026-12-12', 'Attending National Academic Leadership & Accreditation Summit.', 'APPROVED', 'Approved for institutional advancement conference.')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 7. SEED INITIAL ACTIVITY LOGS
    INSERT INTO activity_logs (user_email, action, details, severity)
    VALUES
    ('admin@studentreport.com', 'SYSTEM_UPGRADE', 'Oakridge Academy upgraded to Enterprise Academic Management Architecture.', 'INFO'),
    ('admin@studentreport.com', 'TIMETABLE_PUBLISHED', 'Weekly master timetable published for Grade 10 Section A.', 'INFO'),
    ('admin@studentreport.com', 'FEE_CYCLE_INITIATED', 'Fall 2026 tuition invoices generated for all active students.', 'INFO');

END $$;
