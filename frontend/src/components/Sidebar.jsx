import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ClipboardCheck,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  Sliders,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Classes & Sections', path: '/admin/classes', icon: Layers },
    { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { name: 'Academic Years', path: '/admin/academic-years', icon: Calendar },
    { name: 'Examinations', path: '/admin/examinations', icon: Award },
    { name: 'Marks Management', path: '/marks/entry', icon: Award },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Teacher Remarks', path: '/remarks', icon: MessageSquare },
    { name: 'Report Cards', path: '/reports', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Grading Scales', path: '/admin/grading', icon: Sliders },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const teacherNav = [
    { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Classes', path: '/teacher/classes', icon: Layers },
    { name: 'Marks Entry', path: '/marks/entry', icon: Award },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Student Remarks', path: '/remarks', icon: MessageSquare },
    { name: 'Report Cards', path: '/reports', icon: FileText },
    { name: 'Class Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const studentNav = [
    { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: GraduationCap },
    { name: 'My Marks & Grades', path: '/student/marks', icon: Award },
    { name: 'My Attendance', path: '/student/attendance', icon: ClipboardCheck },
    { name: 'Teacher Remarks', path: '/student/remarks', icon: MessageSquare },
    { name: 'Report Cards & PDF', path: '/student/reports', icon: FileText },
  ];

  const parentNav = [
    { name: 'Parent Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { name: 'Children Profiles', path: '/parent/children', icon: Users },
    { name: 'Academic Results', path: '/parent/results', icon: Award },
    { name: 'Attendance Records', path: '/parent/attendance', icon: ClipboardCheck },
    { name: 'Teacher Feedback', path: '/parent/feedback', icon: MessageSquare },
    { name: 'Report Cards', path: '/parent/reports', icon: FileText },
  ];

  let navItems = adminNav;
  if (role === 'TEACHER') navItems = teacherNav;
  if (role === 'STUDENT') navItems = studentNav;
  if (role === 'PARENT') navItems = parentNav;

  return (
    <aside className="w-64 bg-olive-800 text-ivory flex flex-col h-screen fixed left-0 top-0 z-30 shadow-elevated">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 bg-olive-900/60 border-b border-olive-700/50">
        <div className="w-8 h-8 rounded-lg bg-olive-500 flex items-center justify-center mr-3 shadow-sm">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-white">Oakridge Academy</h1>
          <p className="text-[10px] text-olive-300 font-medium uppercase tracking-wider">Report System</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-3 border-b border-olive-700/30 bg-olive-900/20 flex items-center justify-between">
        <span className="text-xs text-olive-200">Access Mode</span>
        <span className="text-[10px] font-semibold bg-olive-500/20 text-olive-100 border border-olive-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {role || 'Guest'}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-olive-500 text-white font-semibold shadow-sm'
                    : 'text-olive-100/80 hover:bg-olive-700/50 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-olive-700/50 bg-olive-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-olive-500 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-olive-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md hover:bg-olive-700/70 text-olive-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
