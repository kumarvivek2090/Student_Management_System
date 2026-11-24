-- ====================================================================
-- STUDENT REPORT SYSTEM - V2 DEFAULT CONFIGURATION
-- Safe, additive initialization: Grading Scales & Application Settings
-- ====================================================================

-- Default Grading Scale (Configurable by Admin)
INSERT INTO grading_scales (id, grade, min_percentage, max_percentage, grade_point, description, is_active)
VALUES 
    (gen_random_uuid(), 'A+', 90.00, 100.00, 4.00, 'Outstanding Performance', TRUE),
    (gen_random_uuid(), 'A',  80.00, 89.99,  3.70, 'Excellent Performance', TRUE),
    (gen_random_uuid(), 'B+', 70.00, 79.99,  3.30, 'Very Good Performance', TRUE),
    (gen_random_uuid(), 'B',  60.00, 69.99,  3.00, 'Good Performance', TRUE),
    (gen_random_uuid(), 'C',  50.00, 59.99,  2.00, 'Satisfactory Performance', TRUE),
    (gen_random_uuid(), 'D',  40.00, 49.99,  1.00, 'Pass', TRUE),
    (gen_random_uuid(), 'F',  0.00,  39.99,  0.00, 'Needs Improvement / Fail', TRUE)
ON CONFLICT (grade) DO NOTHING;

-- Default Application Settings
INSERT INTO app_settings (id, setting_key, setting_value, description)
VALUES
    (gen_random_uuid(), 'INSTITUTION_NAME', 'Oakridge International Academy', 'Official institution name displayed on reports'),
    (gen_random_uuid(), 'INSTITUTION_EMAIL', 'info@oakridge.edu', 'Institutional contact email'),
    (gen_random_uuid(), 'INSTITUTION_PHONE', '+1 (555) 234-5678', 'Institutional contact phone number'),
    (gen_random_uuid(), 'INSTITUTION_ADDRESS', '452 Academy Way, Suite 100, Cambridge, MA', 'Official institutional campus address'),
    (gen_random_uuid(), 'PASSING_PERCENTAGE', '40.0', 'Minimum percentage required to pass an assessment'),
    (gen_random_uuid(), 'MIN_ATTENDANCE_PERCENTAGE', '75.0', 'Minimum required attendance percentage'),
    (gen_random_uuid(), 'ACADEMIC_YEAR', '2026-2027', 'Active academic year identifier')
ON CONFLICT (setting_key) DO NOTHING;
