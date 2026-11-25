import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePopover from './common/ProfilePopover';
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
  Clock,
  UserCheck,
  CreditCard,
  Bell,
  History,
  Database,
  RefreshCw,
  TrendingUp,
  FolderArchive,
  FileCheck,
  Send,
  AlertTriangle,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const role = user?.role;

  // 1. ADMIN NAVIGATION (21 Items grouped into 5 enterprise sections)
  const adminSections = [
    {
      title: 'Core Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Academic Structure',
      items: [
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Teachers', path: '/admin/teachers', icon: Users },
        { name: 'Classes & Sections', path: '/admin/classes', icon: Layers },
        { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
        { name: 'Timetable Management', path: '/admin/timetable', icon: Clock },
        { name: 'Academic Calendar', path: '/admin/calendar', icon: Calendar },
        { name: 'Examinations', path: '/admin/examinations', icon: Award },
      ]
    },
    {
      title: 'Grading & Records',
      items: [
        { name: 'Marks Management', path: '/marks/entry', icon: Award },
        { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
        { name: 'Teacher Remarks', path: '/remarks', icon: MessageSquare },
        { name: 'Report Cards & PDF', path: '/reports', icon: FileText },
      ]
    },
    {
      title: 'Management & Billing',
      items: [
        { name: 'User Management', path: '/admin/users', icon: UserCheck },
        { name: 'Fee Management', path: '/admin/fees', icon: CreditCard },
        { name: 'Notifications & Announcements', path: '/admin/notifications', icon: Bell },
        { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
      ]
    },
    {
      title: 'System & Security',
      items: [
        { name: 'Database Management', path: '/admin/database', icon: Database },
        { name: 'Backup & Restore', path: '/admin/backup', icon: RefreshCw },
        { name: 'Security & Permissions', path: '/admin/security', icon: ShieldCheck },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  // 2. TEACHER NAVIGATION (13 Items grouped into 3 sections)
  const teacherSections = [
    {
      title: 'Classroom Overview',
      items: [
        { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Assigned Classes', path: '/teacher/classes', icon: Layers },
        { name: 'My Timetable', path: '/teacher/timetable', icon: Clock },
      ]
    },
    {
      title: 'Academic Operations',
      items: [
        { name: 'Marks Entry', path: '/marks/entry', icon: Award },
        { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
        { name: 'Assignments', path: '/teacher/assignments', icon: FileCheck },
        { name: 'Exams & Assessments', path: '/admin/examinations', icon: Award },
        { name: 'Student Progress', path: '/teacher/progress', icon: TrendingUp },
        { name: 'Class Materials', path: '/teacher/materials', icon: FolderArchive },
        { name: 'Student Remarks', path: '/remarks', icon: MessageSquare },
      ]
    },
    {
      title: 'Records & Requests',
      items: [
        { name: 'Leave Requests', path: '/teacher/leaves', icon: Calendar },
        { name: 'Report Cards', path: '/reports', icon: FileText },
        { name: 'Notifications', path: '/teacher/notifications', icon: Bell },
      ]
    }
  ];

  // 3. STUDENT NAVIGATION (13 Items grouped into 3 sections)
  const studentSections = [
    {
      title: 'Student Desk',
      items: [
        { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', path: '/student/profile', icon: GraduationCap },
        { name: 'My Timetable', path: '/student/timetable', icon: Clock },
      ]
    },
    {
      title: 'Academics & Submissions',
      items: [
        { name: 'My Marks & Grades', path: '/student/marks', icon: Award },
        { name: 'My Attendance', path: '/student/attendance', icon: ClipboardCheck },
        { name: 'Assignments & Submissions', path: '/student/assignments', icon: FileCheck },
        { name: 'Exam Schedule', path: '/student/exams', icon: Calendar },
        { name: 'Learning Resources', path: '/student/resources', icon: BookOpen },
      ]
    },
    {
      title: 'Finances & Records',
      items: [
        { name: 'Fee Details', path: '/student/fees', icon: CreditCard },
        { name: 'Leave Application', path: '/student/leave-apply', icon: Send },
        { name: 'Teacher Remarks', path: '/student/remarks', icon: MessageSquare },
        { name: 'Report Cards & PDF', path: '/student/reports', icon: FileText },
        { name: 'Notifications', path: '/student/notifications', icon: Bell },
      ]
    }
  ];

  // 4. PARENT NAVIGATION (12 Items grouped into 3 sections)
  const parentSections = [
    {
      title: 'Family Portal',
      items: [
        { name: 'Parent Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
        { name: 'Children Profiles', path: '/parent/children', icon: Users },
      ]
    },
    {
      title: 'Academic Performance',
      items: [
        { name: 'Academic Results', path: '/parent/results', icon: Award },
        { name: 'Attendance Records', path: '/parent/attendance', icon: ClipboardCheck },
        { name: 'Attendance Alerts', path: '/parent/alerts', icon: AlertTriangle },
        { name: 'Exam Schedule', path: '/parent/exams', icon: Calendar },
        { name: 'Academic Calendar', path: '/parent/calendar', icon: CalendarDays },
      ]
    },
    {
      title: 'Finances & Liaison',
      items: [
        { name: 'Fee & Payments', path: '/parent/fees', icon: CreditCard },
        { name: 'Teacher Feedback', path: '/parent/feedback', icon: MessageSquare },
        { name: 'Teacher Communication', path: '/parent/communication', icon: Mail },
        { name: 'Report Cards', path: '/parent/reports', icon: FileText },
        { name: 'Notifications', path: '/parent/notifications', icon: Bell },
      ]
    }
  ];

  let currentSections = adminSections;
  if (role === 'TEACHER') currentSections = teacherSections;
  if (role === 'STUDENT') currentSections = studentSections;
  if (role === 'PARENT') currentSections = parentSections;

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#243629]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`${sidebarWidth} bg-[#1D251A] text-ivory flex flex-col h-screen fixed left-0 top-0 z-50 shadow-elevated transition-all duration-300 ease-in-out border-r border-[#2F3C21] select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-[#151B13] border-b border-[#2F3C21] shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#52613B] flex items-center justify-center shrink-0 shadow-md border border-[#7B8F5E]/40">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm tracking-wide text-white truncate">Oakridge Academy</h1>
                <p className="text-[10px] text-[#CAD6B7] font-semibold uppercase tracking-wider">Enterprise ERP</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-[#242E20] hover:bg-[#2F3C21] text-[#E4EAD9] transition-colors border border-[#3F4D2D]/60"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar expansion"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#242E20] text-[#CAD6B7]"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Identity Tag */}
        {!isCollapsed && (
          <div className="px-5 py-2.5 border-b border-[#2F3C21]/60 bg-[#1A2217] flex items-center justify-between shrink-0">
            <span className="text-[11px] font-medium text-[#CAD6B7]">Access Authority</span>
            <span className="text-[10px] font-bold bg-[#52613B]/40 text-[#E4EAD9] border border-[#7B8F5E]/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {role || 'Guest'}
            </span>
          </div>
        )}

        {/* Categorized Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin">
          {currentSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pt-1 pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#7B8F5E] block">
                    {section.title}
                  </span>
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.path} className="relative group">
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-[#52613B] text-white shadow-md border border-[#7B8F5E]/50'
                            : 'text-[#E4EAD9] hover:bg-[#2F3C21] hover:text-white'
                        }`
                      }
                    >
                      <div className={`flex items-center ${isCollapsed ? 'space-x-0' : 'space-x-3'} overflow-hidden`}>
                        <Icon className="w-4 h-4 shrink-0 text-[#E4EAD9]" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0 text-[#CAD6B7]" />}
                    </NavLink>

                    {/* Floating Tooltip when Sidebar is Collapsed */}
                    {isCollapsed && (
                      <div className="fixed left-20 ml-2 hidden group-hover:flex items-center z-50 pointer-events-none">
                        <div className="bg-[#151B13] text-white border border-[#2F3C21] shadow-2xl text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap animate-fadeIn">
                          {item.name}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer with Interactive Profile Popover */}
        <div className={`border-t border-[#2F3C21] bg-[#141A12] shrink-0 mt-auto ${isCollapsed ? 'p-2.5' : 'p-3'}`}>
          <ProfilePopover
            position="sidebar"
            isCollapsed={isCollapsed}
            className="w-full"
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
