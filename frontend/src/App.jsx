import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Core Dashboards & Existing Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard from './dashboards/ParentDashboard';

import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import ClassManagement from './pages/ClassManagement';
import SubjectManagement from './pages/SubjectManagement';
import AcademicYearManagement from './pages/AcademicYearManagement';
import ExaminationManagement from './pages/ExaminationManagement';
import MarksEntry from './pages/MarksEntry';
import AttendanceManagement from './pages/AttendanceManagement';
import TeacherRemarks from './pages/TeacherRemarks';
import ReportCards from './pages/ReportCards';
import AnalyticsPage from './pages/AnalyticsPage';
import GradingConfiguration from './pages/GradingConfiguration';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Enterprise Management Pages
import TimetableManagement from './pages/TimetableManagement';
import AcademicCalendarPage from './pages/AcademicCalendarPage';
import UserManagement from './pages/UserManagement';
import FeeManagement from './pages/FeeManagement';
import NotificationManagement from './pages/NotificationManagement';
import ActivityLogsPage from './pages/ActivityLogsPage';
import DatabaseManagement from './pages/DatabaseManagement';
import BackupRestorePage from './pages/BackupRestorePage';
import SecurityPermissionsPage from './pages/SecurityPermissionsPage';

// Teacher Enterprise Pages
import AssignedClassesPage from './pages/AssignedClassesPage';
import TeacherTimetablePage from './pages/TeacherTimetablePage';
import TeacherAssignmentsPage from './pages/TeacherAssignmentsPage';
import StudentProgressPage from './pages/StudentProgressPage';
import ClassMaterialsPage from './pages/ClassMaterialsPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';

// Student Enterprise Pages
import StudentProfilePage from './pages/StudentProfilePage';
import StudentTimetablePage from './pages/StudentTimetablePage';
import StudentMarksPage from './pages/StudentMarksPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import ExamSchedulePage from './pages/ExamSchedulePage';
import LearningResourcesPage from './pages/LearningResourcesPage';
import StudentFeePage from './pages/StudentFeePage';
import StudentRemarksPage from './pages/StudentRemarksPage';

// Parent Enterprise Pages
import ParentCommunicationPage from './pages/ParentCommunicationPage';
import AttendanceAlertsPage from './pages/AttendanceAlertsPage';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes inside MainLayout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        
        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><TeacherManagement /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['ADMIN']}><ClassManagement /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><SubjectManagement /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['ADMIN']}><TimetableManagement /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['ADMIN']}><AcademicCalendarPage /></ProtectedRoute>} />
        <Route path="/admin/examinations" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><ExaminationManagement /></ProtectedRoute>} />
        <Route path="/admin/marks" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><MarksEntry /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/admin/remarks" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><TeacherRemarks /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><ReportCards /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['ADMIN']}><FeeManagement /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><NotificationManagement /></ProtectedRoute>} />
        <Route path="/admin/activity-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><ActivityLogsPage /></ProtectedRoute>} />
        <Route path="/admin/database" element={<ProtectedRoute allowedRoles={['ADMIN']}><DatabaseManagement /></ProtectedRoute>} />
        <Route path="/admin/backup" element={<ProtectedRoute allowedRoles={['ADMIN']}><BackupRestorePage /></ProtectedRoute>} />
        <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['ADMIN']}><SecurityPermissionsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/academic-years" element={<ProtectedRoute allowedRoles={['ADMIN']}><AcademicYearManagement /></ProtectedRoute>} />
        <Route path="/admin/grading" element={<ProtectedRoute allowedRoles={['ADMIN']}><GradingConfiguration /></ProtectedRoute>} />

        {/* ==================== TEACHER ROUTES ==================== */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><AssignedClassesPage /></ProtectedRoute>} />
        <Route path="/teacher/timetable" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherTimetablePage /></ProtectedRoute>} />
        <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><MarksEntry /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherAssignmentsPage /></ProtectedRoute>} />
        <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><ExaminationManagement /></ProtectedRoute>} />
        <Route path="/teacher/progress" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><StudentProgressPage /></ProtectedRoute>} />
        <Route path="/teacher/materials" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><ClassMaterialsPage /></ProtectedRoute>} />
        <Route path="/teacher/remarks" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherRemarks /></ProtectedRoute>} />
        <Route path="/teacher/leaves" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><LeaveRequestsPage /></ProtectedRoute>} />
        <Route path="/teacher/reports" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><ReportCards /></ProtectedRoute>} />
        <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><NotificationManagement /></ProtectedRoute>} />

        {/* ==================== STUDENT ROUTES ==================== */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentProfilePage /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentTimetablePage /></ProtectedRoute>} />
        <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentMarksPage /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentAttendancePage /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentAssignmentsPage /></ProtectedRoute>} />
        <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><ExamSchedulePage /></ProtectedRoute>} />
        <Route path="/student/resources" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><LearningResourcesPage /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentFeePage /></ProtectedRoute>} />
        <Route path="/student/leave-apply" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><LeaveRequestsPage /></ProtectedRoute>} />
        <Route path="/student/remarks" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><StudentRemarksPage /></ProtectedRoute>} />
        <Route path="/student/reports" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><ReportCards /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><NotificationManagement /></ProtectedRoute>} />

        {/* ==================== PARENT ROUTES ==================== */}
        <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/children" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/results" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/attendance" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/alerts" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><AttendanceAlertsPage /></ProtectedRoute>} />
        <Route path="/parent/exams" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ExamSchedulePage /></ProtectedRoute>} />
        <Route path="/parent/calendar" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><AcademicCalendarPage /></ProtectedRoute>} />
        <Route path="/parent/fees" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><StudentFeePage /></ProtectedRoute>} />
        <Route path="/parent/feedback" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><StudentRemarksPage /></ProtectedRoute>} />
        <Route path="/parent/communication" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ParentCommunicationPage /></ProtectedRoute>} />
        <Route path="/parent/reports" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><ReportCards /></ProtectedRoute>} />
        <Route path="/parent/notifications" element={<ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}><NotificationManagement /></ProtectedRoute>} />

        {/* Shared Legacy Route Aliases */}
        <Route path="/marks/entry" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><MarksEntry /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/remarks" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}><TeacherRemarks /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}><ReportCards /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><AnalyticsPage /></ProtectedRoute>} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
