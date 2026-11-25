-- V5__leave_management_enhancements.sql
-- Enterprise Leave Management & Multi-Role Approval Workflow Enhancements

-- 1. Relax or drop existing check constraints to allow new leave types and status
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_leave_type_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_leave_type_check 
    CHECK (leave_type IN ('SICK', 'CASUAL', 'FAMILY', 'MEDICAL', 'ACADEMIC', 'EMERGENCY', 'PERSONAL', 'OTHER'));

ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_status_check 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'));

-- 2. Add columns for supporting documents, register faculty recommendations, and decision timestamps
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS document_url VARCHAR(500);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS faculty_recommendation TEXT;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS recommended_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS decision_at TIMESTAMP WITH TIME ZONE;

-- 3. Create indexes for performance and multi-role lookups
CREATE INDEX IF NOT EXISTS idx_leave_requests_role ON leave_requests(role);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
