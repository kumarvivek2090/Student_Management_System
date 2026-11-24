import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
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
        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent Dashboard */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Management */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />

        {/* Teacher Management */}
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TeacherManagement />
            </ProtectedRoute>
          }
        />

        {/* Academic Setup */}
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ClassManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SubjectManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic-years"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AcademicYearManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/examinations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <ExaminationManagement />
            </ProtectedRoute>
          }
        />

        {/* Shared Operations */}
        <Route
          path="/marks/entry"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <MarksEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <AttendanceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remarks"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
              <TeacherRemarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
              <ReportCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/grading"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <GradingConfiguration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Student / Parent direct aliases */}
        <Route path="/student/profile" element={<StudentDashboard />} />
        <Route path="/student/marks" element={<StudentDashboard />} />
        <Route path="/student/attendance" element={<StudentDashboard />} />
        <Route path="/student/remarks" element={<TeacherRemarks />} />
        <Route path="/student/reports" element={<ReportCards />} />

        <Route path="/parent/children" element={<ParentDashboard />} />
        <Route path="/parent/results" element={<ParentDashboard />} />
        <Route path="/parent/attendance" element={<ParentDashboard />} />
        <Route path="/parent/feedback" element={<TeacherRemarks />} />
        <Route path="/parent/reports" element={<ReportCards />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
