-- ====================================================================
-- V3 PERFORMANCE OPTIMIZATION INDEXES
-- Neon PostgreSQL Compatible
-- ====================================================================

-- 1. Students composite lookup & roll number search
CREATE INDEX IF NOT EXISTS idx_students_class_sec_roll ON students(class_id, section_id, roll_number);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_id);

-- 2. Assessment marks high-frequency joins & aggregates
CREATE INDEX IF NOT EXISTS idx_marks_student_assessment ON assessment_marks(student_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_marks_assessment_calc ON assessment_marks(assessment_id, is_absent, obtained_marks);

-- 3. Attendance high-frequency date & status queries
CREATE INDEX IF NOT EXISTS idx_att_student_date_status ON attendance_records(student_id, attendance_date, status);
CREATE INDEX IF NOT EXISTS idx_att_class_date ON attendance_records(class_id, section_id, attendance_date);

-- 4. Teacher remarks published status & reverse chronological sort
CREATE INDEX IF NOT EXISTS idx_remarks_student_pub ON teacher_remarks(student_id, is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_remarks_teacher ON teacher_remarks(teacher_id, created_at DESC);

-- 5. Parent student relationships
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student(parent_id, student_id);

-- 6. Teacher allocations
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_lookup ON teacher_assignments(teacher_id, class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_subject ON teacher_assignments(subject_id);

-- 7. Assessments exam & subject joins
CREATE INDEX IF NOT EXISTS idx_assessments_exam_subject ON assessments(examination_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_examinations_year_sem ON examinations(academic_year_id, semester_id);
