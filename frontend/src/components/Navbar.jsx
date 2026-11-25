import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  Calendar,
  Check,
  ExternalLink,
  X,
  User,
  Sun,
  Moon,
  Zap,
  Activity,
  Layers,
  BookOpen,
  Users,
  Award,
  ClipboardCheck,
  FileText,
  CreditCard,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCheck,
  Trash2
} from 'lucide-react';
import api from '../utils/api';
import ProfilePopover from './common/ProfilePopover';
import SystemHealthModal from './common/SystemHealthModal';
import toast from 'react-hot-toast';

const Navbar = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState('all'); // 'all' | 'unread'

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  const quickActionsRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Command Palette Items with Categorization
  const commandPaletteItems = [
    // 1. Quick Actions
    {
      category: 'Quick Actions',
      name: 'Assessment Marks Entry',
      subtitle: 'Record subject marks and calculate grades',
      path: user?.role === 'TEACHER' ? '/teacher/marks-entry' : '/marks/entry',
      icon: Award,
      roles: ['ADMIN', 'TEACHER']
    },
    {
      category: 'Quick Actions',
      name: 'Class Attendance Register',
      subtitle: 'Record daily student attendance statuses',
      path: user?.role === 'TEACHER' ? '/teacher/attendance' : '/attendance',
      icon: ClipboardCheck,
      roles: ['ADMIN', 'TEACHER']
    },
    {
      category: 'Quick Actions',
      name: 'Generate Official Report Cards',
      subtitle: 'Publish academic PDF report cards',
      path: user?.role === 'TEACHER' ? '/teacher/report-cards' : user?.role === 'STUDENT' ? '/student/reports' : '/reports',
      icon: FileText,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    },
    {
      category: 'Quick Actions',
      name: 'File Leave Request',
      subtitle: 'Apply for leave of absence',
      path: user?.role === 'TEACHER' ? '/teacher/leaves' : '/student/leaves',
      icon: Clock,
      roles: ['TEACHER', 'STUDENT']
    },
    {
      category: 'Quick Actions',
      name: 'Fee Payment & Invoices',
      subtitle: 'View fee structures, balance, and records',
      path: user?.role === 'ADMIN' ? '/admin/fees' : user?.role === 'PARENT' ? '/parent/fees' : '/student/fees',
      icon: CreditCard,
      roles: ['ADMIN', 'STUDENT', 'PARENT']
    },

    // 2. Navigation Modules
    { category: 'Modules', name: 'Academic ERP Dashboard', path: user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'TEACHER' ? '/teacher/dashboard' : user?.role === 'PARENT' ? '/parent/dashboard' : '/student/dashboard', icon: Layers, roles: ['ALL'] },
    { category: 'Modules', name: 'Master Timetables', path: user?.role === 'ADMIN' ? '/admin/timetable' : user?.role === 'TEACHER' ? '/teacher/timetable' : '/student/timetable', icon: Clock, roles: ['ALL'] },
    { category: 'Modules', name: 'Academic Calendar & Milestones', path: user?.role === 'ADMIN' ? '/admin/calendar' : user?.role === 'PARENT' ? '/parent/calendar' : '/admin/calendar', icon: Calendar, roles: ['ALL'] },
    { category: 'Modules', name: 'Course Assignments & Homework', path: user?.role === 'TEACHER' ? '/teacher/assignments' : '/student/assignments', icon: BookOpen, roles: ['TEACHER', 'STUDENT'] },
    { category: 'Modules', name: 'Digital Learning Resources', path: user?.role === 'TEACHER' ? '/teacher/materials' : '/student/materials', icon: BookOpen, roles: ['TEACHER', 'STUDENT'] },
    { category: 'Modules', name: 'User & Faculty Management', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
    { category: 'Modules', name: 'Activity Audit Logs', path: '/admin/activity-logs', icon: ShieldCheck, roles: ['ADMIN'] },
    { category: 'Modules', name: 'System Database Health', path: '/admin/database', icon: Activity, roles: ['ADMIN'] },
    { category: 'Modules', name: 'My Profile & Credentials', path: '/student/profile', icon: User, roles: ['STUDENT'] }
  ];

  // Filter items matching active role and query
  const filteredCommands = commandPaletteItems.filter((item) => {
    const roleMatches = item.roles.includes('ALL') || item.roles.includes(user?.role);
    if (!roleMatches) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q)
    );
  });

  // Global Keyboard Listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation inside Command Palette
  useEffect(() => {
    if (showSearchModal) {
      setSelectedSearchIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal, searchQuery]);

  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedSearchIndex];
      if (target) {
        setShowSearchModal(false);
        navigate(target.path);
      }
    } else if (e.key === 'Escape') {
      setShowSearchModal(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count & notifications
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (e) {}
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data || []);
        }
      } catch (e) {}
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (e) {}
  };

  const markSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification dismissed');
  };

  // Role-based Quick Actions list
  const getQuickActionsForRole = () => {
    const role = user?.role;
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Enter Student Marks', path: '/marks/entry', icon: Award, desc: 'Record exam results' },
          { name: 'Take Daily Attendance', path: '/attendance', icon: ClipboardCheck, desc: 'Roll-call submission' },
          { name: 'Fee Collections & Invoices', path: '/admin/fees', icon: CreditCard, desc: 'Billing overview' },
          { name: 'Academic Calendar', path: '/admin/calendar', icon: Calendar, desc: 'Schedule milestones' },
          { name: 'User Management', path: '/admin/users', icon: Users, desc: 'Add or configure users' },
          { name: 'System Telemetry', action: () => setShowHealthModal(true), icon: Activity, desc: 'Live DB connection' }
        ];
      case 'TEACHER':
        return [
          { name: 'Assessment Marks Entry', path: '/teacher/marks-entry', icon: Award, desc: 'Grade assigned classes' },
          { name: 'Daily Attendance', path: '/teacher/attendance', icon: ClipboardCheck, desc: 'Record student attendance' },
          { name: 'Create Assignment', path: '/teacher/assignments', icon: BookOpen, desc: 'Post homework & tasks' },
          { name: 'Upload Study Material', path: '/teacher/materials', icon: Layers, desc: 'Digital syllabi & notes' },
          { name: 'Student Progress', path: '/teacher/progress', icon: Users, desc: 'Cohort analytics' },
          { name: 'File Leave Request', path: '/teacher/leaves', icon: Clock, desc: 'Submit absence request' }
        ];
      case 'STUDENT':
        return [
          { name: 'View Marks & Grades', path: '/student/marks', icon: Award, desc: 'Subject performance' },
          { name: 'Attendance Record', path: '/student/attendance', icon: ClipboardCheck, desc: 'Daily presence status' },
          { name: 'Weekly Timetable', path: '/student/timetable', icon: Clock, desc: 'Class schedules' },
          { name: 'Digital Report Cards', path: '/student/reports', icon: FileText, desc: 'Download official PDF' },
          { name: 'Course Assignments', path: '/student/assignments', icon: BookOpen, desc: 'Pending homework' },
          { name: 'Apply For Leave', path: '/student/leaves', icon: Calendar, desc: 'Submit absence notice' }
        ];
      case 'PARENT':
        return [
          { name: 'Academic Results', path: '/parent/results', icon: Award, desc: 'Subject grades & feedback' },
          { name: 'Attendance Overview', path: '/parent/attendance', icon: ClipboardCheck, desc: 'Daily presence alerts' },
          { name: 'Fee Payments', path: '/parent/fees', icon: CreditCard, desc: 'Tuition records & pay' },
          { name: 'Message Teacher', path: '/parent/communication', icon: User, desc: 'Direct faculty contact' },
          { name: 'Report Cards', path: '/parent/reports', icon: FileText, desc: 'Download official PDFs' },
          { name: 'Academic Calendar', path: '/parent/calendar', icon: Calendar, desc: 'Term milestones' }
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActionsForRole();

  const displayedNotifications =
    notificationTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#151B13] border-b border-[#E3E1D6] dark:border-[#2F3C21] flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-subtle transition-colors duration-200">
        {/* Left: Mobile Toggle & Page Header */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-[#F0EFE6] dark:bg-[#1D251A] text-[#242820] dark:text-[#E8EDE4] hover:bg-[#E4EAD9] transition-colors"
            title="Open Menu"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="overflow-hidden">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-[#242820] dark:text-white tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-[#555B50] dark:text-[#CAD6B7] font-medium hidden sm:block truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* 1. Global Command Palette Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 bg-[#F8F7F2] dark:bg-[#1D251A] hover:bg-[#F0EFE6] dark:hover:bg-[#242E20] border border-[#E3E1D6] dark:border-[#2F3C21] text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-colors"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#52613B] dark:text-[#CAD6B7]" />
            <span className="hidden md:inline font-medium">Quick search...</span>
            <kbd className="hidden md:inline text-[10px] bg-white dark:bg-[#151B13] border border-[#CAD6B7] dark:border-[#2F3C21] px-1.5 py-0.5 rounded text-[#242820] dark:text-[#E8EDE4] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* 2. Quick Actions Launcher Dropdown */}
          {quickActions.length > 0 && (
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 border ${
                  showQuickActions
                    ? 'bg-[#52613B] text-white border-[#52613B]'
                    : 'bg-[#F8F7F2] dark:bg-[#1D251A] hover:bg-[#F0EFE6] dark:hover:bg-[#242E20] border-[#E3E1D6] dark:border-[#2F3C21] text-[#242820] dark:text-[#E8EDE4]'
                }`}
                title="Quick Actions Launcher"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="hidden xl:inline text-xs font-bold">Actions</span>
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1D251A] rounded-2xl shadow-2xl border border-[#E7E5DA] dark:border-[#2F3C21] p-2 z-50 animate-slideDown">
                  <div className="p-2 border-b border-[#F0EFE6] dark:border-[#2F3C21]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#52613B] dark:text-[#CAD6B7] block">
                      Fast Actions • {user?.role}
                    </span>
                  </div>
                  <div className="space-y-1 py-1">
                    {quickActions.map((qa, idx) => {
                      const Icon = qa.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setShowQuickActions(false);
                            if (qa.action) qa.action();
                            else if (qa.path) navigate(qa.path);
                          }}
                          className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-[#F8F7F2] dark:hover:bg-[#242E20] transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] dark:bg-[#151B13] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] dark:text-[#CAD6B7] shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#242820] dark:text-white truncate">
                              {qa.name}
                            </p>
                            <p className="text-[10px] text-[#555B50] dark:text-[#CAD6B7] truncate">
                              {qa.desc}
                            </p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-[#CAD6B7] group-hover:text-[#52613B]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Live System Telemetry Status Pill */}
          <button
            onClick={() => setShowHealthModal(true)}
            className="hidden lg:flex items-center space-x-1.5 bg-[#EAF5EC] dark:bg-[#1A261B] hover:bg-[#DDF0E0] border border-[#BCE1C5] dark:border-[#284E2D] px-2.5 py-1 rounded-full text-xs font-bold text-[#198754] transition-colors"
            title="Real-time System Status: 99.99% Uptime • Click for telemetry"
          >
            <span className="w-2 h-2 rounded-full bg-[#198754] animate-pulse" />
            <span className="text-[11px]">System: Optimal</span>
          </button>

          {/* 4. Light / Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[#F0EFE6] dark:hover:bg-[#1D251A] text-[#242820] dark:text-[#E8EDE4] transition-colors border border-transparent hover:border-[#E3E1D6] dark:hover:border-[#2F3C21]"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            aria-label="Toggle light and dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-[#52613B] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* 5. Notifications Trigger with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotifications}
              className="p-2 rounded-xl hover:bg-[#F0EFE6] dark:hover:bg-[#1D251A] text-[#242820] dark:text-[#E8EDE4] transition-colors relative border border-transparent hover:border-[#E3E1D6] dark:hover:border-[#2F3C21]"
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#DC4545] text-white text-[9px] font-bold rounded-full border border-white dark:border-[#151B13]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#1D251A] rounded-2xl shadow-2xl border border-[#E7E5DA] dark:border-[#2F3C21] overflow-hidden z-50 animate-slideDown">
                <div className="p-3 bg-[#F8F7F2] dark:bg-[#151B13] border-b border-[#E3E1D6] dark:border-[#2F3C21] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#242820] dark:text-white">Notification Center</span>
                    <span className="text-[10px] bg-[#E4EAD9] dark:bg-[#242E20] text-[#52613B] dark:text-[#CAD6B7] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#52613B] dark:text-[#CAD6B7] hover:underline font-bold flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-[#F0EFE6] dark:border-[#2F3C21] px-3 pt-2 bg-white dark:bg-[#1D251A] text-xs">
                  <button
                    onClick={() => setNotificationTab('all')}
                    className={`pb-2 px-3 font-bold border-b-2 transition-colors ${
                      notificationTab === 'all'
                        ? 'border-[#52613B] text-[#52613B] dark:text-white'
                        : 'border-transparent text-[#74796D] hover:text-[#242820]'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotificationTab('unread')}
                    className={`pb-2 px-3 font-bold border-b-2 transition-colors ${
                      notificationTab === 'unread'
                        ? 'border-[#52613B] text-[#52613B] dark:text-white'
                        : 'border-transparent text-[#74796D] hover:text-[#242820]'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Notification Items */}
                <div className="divide-y divide-[#F0EFE6] dark:divide-[#2F3C21] max-h-72 overflow-y-auto">
                  {displayedNotifications.length > 0 ? (
                    displayedNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors group ${
                          n.isRead
                            ? 'bg-white dark:bg-[#1D251A]'
                            : 'bg-[#F8F7F2] dark:bg-[#242E20]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-[#242820] dark:text-white leading-snug">
                            {n.title}
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#74796D] bg-[#F0EFE6] dark:bg-[#151B13] px-1.5 py-0.5 rounded shrink-0">
                            {n.type}
                          </span>
                        </div>
                        <p className="text-[#555B50] dark:text-[#CAD6B7] mt-1 text-[11px] leading-relaxed">
                          {n.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-transparent group-hover:border-[#E3E1D6]/40 text-[10px]">
                          <span className="text-[#74796D]">Recent</span>
                          <div className="flex items-center space-x-2">
                            {!n.isRead && (
                              <button
                                onClick={() => markSingleRead(n.id)}
                                className="text-[#52613B] dark:text-[#CAD6B7] hover:underline font-semibold"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => dismissNotification(n.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Dismiss"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#74796D]">
                      <Bell className="w-8 h-8 text-[#CAD6B7] mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No notifications in this view</p>
                    </div>
                  )}
                </div>

                {/* Footer link */}
                <div className="p-2.5 bg-[#F8F7F2] dark:bg-[#151B13] border-t border-[#E3E1D6] dark:border-[#2F3C21] text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      const targetPath =
                        user?.role === 'ADMIN'
                          ? '/admin/notifications'
                          : user?.role === 'TEACHER'
                          ? '/teacher/notifications'
                          : user?.role === 'PARENT'
                          ? '/parent/notifications'
                          : '/student/notifications';
                      navigate(targetPath);
                    }}
                    className="text-xs text-[#52613B] dark:text-[#CAD6B7] hover:underline font-bold"
                  >
                    View All Institutional Announcements &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. User Profile Pill with Interactive Hover Popover */}
          <div className="pl-1.5 sm:pl-2.5 border-l border-[#E3E1D6] dark:border-[#2F3C21]">
            <ProfilePopover position="header" />
          </div>
        </div>
      </header>

      {/* GLOBAL COMMAND PALETTE MODAL (Cmd+K / Ctrl+K) */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-[#243629]/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 animate-fadeIn"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1D251A] rounded-2xl shadow-2xl border border-[#E7E5DA] dark:border-[#2F3C21] w-full max-w-xl overflow-hidden animate-slideDown text-[#242820] dark:text-[#E8EDE4]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="p-4 border-b border-[#E3E1D6] dark:border-[#2F3C21] flex items-center space-x-3 bg-[#F8F7F2] dark:bg-[#151B13]">
              <Search className="w-5 h-5 text-[#52613B] dark:text-[#CAD6B7]" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder="Type a command, page name, or quick action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                className="w-full bg-transparent text-sm font-semibold text-[#242820] dark:text-white placeholder-[#74796D] focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg hover:bg-[#E3E1D6] dark:hover:bg-[#2F3C21] text-[#555B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions & Results */}
            <div className="p-2 max-h-84 overflow-y-auto divide-y divide-[#F0EFE6] dark:divide-[#2F3C21]/60">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedSearchIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setShowSearchModal(false);
                        navigate(item.path);
                      }}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#52613B] text-white shadow-sm'
                          : 'hover:bg-[#F8F7F2] dark:hover:bg-[#242E20]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#F0EFE6] dark:bg-[#151B13] text-[#52613B] dark:text-[#CAD6B7]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-bold truncate ${
                              isSelected ? 'text-white' : 'text-[#242820] dark:text-white'
                            }`}
                          >
                            {item.name}
                          </p>
                          {item.subtitle && (
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-white/80' : 'text-[#555B50] dark:text-[#CAD6B7]'
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#E4EAD9] dark:bg-[#151B13] text-[#52613B] dark:text-[#CAD6B7]'
                          }`}
                        >
                          {item.category}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-white' : 'text-[#CAD6B7]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#74796D]">
                  <Search className="w-8 h-8 text-[#CAD6B7] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold">No matching commands or pages found</p>
                  <p className="text-[10px] mt-1">Try typing "marks", "attendance", "fees", or "calendar"</p>
                </div>
              )}
            </div>

            {/* Footer Keyboard Hints */}
            <div className="p-3 bg-[#F8F7F2] dark:bg-[#151B13] border-t border-[#E3E1D6] dark:border-[#2F3C21] flex items-center justify-between text-[10px] text-[#74796D]">
              <div className="flex items-center space-x-3">
                <span><kbd className="bg-white dark:bg-[#1D251A] px-1 py-0.5 rounded border border-[#CAD6B7] dark:border-[#2F3C21]">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white dark:bg-[#1D251A] px-1 py-0.5 rounded border border-[#CAD6B7] dark:border-[#2F3C21]">↵</kbd> Select</span>
                <span><kbd className="bg-white dark:bg-[#1D251A] px-1 py-0.5 rounded border border-[#CAD6B7] dark:border-[#2F3C21]">Esc</kbd> Close</span>
              </div>
              <span className="font-semibold text-[#52613B] dark:text-[#CAD6B7]">Oakridge Academy OS</span>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM TELEMETRY MODAL */}
      <SystemHealthModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
      />
    </>
  );
};

export default Navbar;
