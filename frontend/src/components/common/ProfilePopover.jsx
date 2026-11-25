import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import {
  User,
  ShieldCheck,
  Settings,
  KeyRound,
  BellRing,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Users,
  Copy,
  Check,
  ExternalLink,
  X,
  Mail,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePopover = ({
  position = 'header', // 'header' | 'sidebar'
  isCollapsed = false,
  customTrigger = null,
  className = ''
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form states for change password modal
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    academicAlerts: true,
    attendanceAlerts: true,
    examSchedules: true,
    gradePublications: true,
    emailDigest: false
  });

  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Clear hover timeout
  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Schedule close with slight debounce so moving cursor between trigger and card is seamless
  const scheduleClose = () => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowSignOutConfirm(false);
        setShowPasswordModal(false);
        setShowHelpModal(false);
        setShowNotificationModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelClose();
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle email copy
  const handleCopyEmail = (e) => {
    e.stopPropagation();
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Determine dynamic role-based identity metadata
  const getRoleMeta = () => {
    const role = user?.role;
    switch (role) {
      case 'ADMIN':
        return {
          title: 'Institutional Administrator',
          badgeText: 'ADMINISTRATOR',
          badgeClass: 'bg-[#52613B] text-white border-[#7B8F5E]',
          identifier: user?.identifier || `ADM-2026-${user?.id ? user.id.substring(0, 4).toUpperCase() : '001'}`,
          department: user?.department || 'Academic Governance & Institutional Operations',
          detailLabel: 'Security Clearance',
          detailValue: 'Superadmin • Level 4 Access',
          viewProfilePath: '/admin/users'
        };
      case 'TEACHER':
        return {
          title: 'Faculty Instructor',
          badgeText: 'FACULTY',
          badgeClass: 'bg-[#3F4D2D] text-white border-[#65774A]',
          identifier: user?.identifier || 'TCH-2026-001',
          department: user?.department || 'Department of Mathematics & Science',
          detailLabel: 'Assigned Cohort',
          detailValue: 'Grade 10-A, Grade 9-B',
          viewProfilePath: '/teacher/classes'
        };
      case 'STUDENT':
        return {
          title: 'Enrolled Scholar',
          badgeText: 'STUDENT',
          badgeClass: 'bg-[#293526] text-white border-[#52613B]',
          identifier: user?.identifier || 'STD-2026-001',
          department: user?.department || 'Senior Secondary Academic Wing',
          detailLabel: 'Class & Roll Number',
          detailValue: `${user?.classSection || 'Grade 10 - Section A'} (Roll #${user?.rollNumber || '101'})`,
          viewProfilePath: '/student/profile'
        };
      case 'PARENT':
        return {
          title: 'Authorized Guardian',
          badgeText: 'GUARDIAN',
          badgeClass: 'bg-[#856D38] text-white border-[#D2B66F]',
          identifier: user?.identifier || `GRD-2026-${user?.id ? user.id.substring(0, 4).toUpperCase() : '001'}`,
          department: user?.department || 'Family & Institutional Network',
          detailLabel: 'Linked Scholar(s)',
          detailValue: user?.childrenSummary || 'Sophia Miller (Grade 10-A)',
          viewProfilePath: '/parent/children'
        };
      default:
        return {
          title: 'Authorized User',
          badgeText: role || 'USER',
          badgeClass: 'bg-[#52613B] text-white border-[#CAD6B7]',
          identifier: user?.identifier || 'USR-2026-001',
          department: user?.department || 'Oakridge Academic Community',
          detailLabel: 'Access Mode',
          detailValue: 'Verified User',
          viewProfilePath: '/settings'
        };
    }
  };

  const meta = getRoleMeta();

  // Action Handlers
  const handleViewProfile = () => {
    setIsOpen(false);
    navigate(meta.viewProfilePath);
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter all required password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully for ' + user?.email);
    }, 800);
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutConfirm(false);
    setIsOpen(false);
    await logout();
  };

  // Positioning classes based on container context
  const getPopoverPlacement = () => {
    if (position === 'header') {
      return 'top-full right-0 mt-2.5 origin-top-right';
    }
    // Sidebar position
    if (isCollapsed) {
      return 'left-full bottom-0 ml-3 origin-bottom-left';
    }
    return 'bottom-full left-0 mb-3 origin-bottom-left';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* TRIGGER BUTTON */}
      <div
        ref={triggerRef}
        onMouseEnter={() => {
          cancelClose();
          setIsOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="cursor-pointer select-none outline-none focus:ring-2 focus:ring-[#52613B]/40 rounded-xl"
      >
        {customTrigger ? (
          customTrigger
        ) : position === 'header' ? (
          <div className="flex items-center space-x-2.5 py-1 px-2 rounded-xl hover:bg-[#F0EFE6] transition-colors border border-transparent hover:border-[#E3E1D6]">
            <ProfileAvatar user={user} size="sm" showStatus={true} />
            <div className="hidden lg:block text-left">
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold text-[#242820] leading-tight truncate max-w-[140px]">
                  {user?.fullName || 'User'}
                </p>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#555B50] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#52613B]' : ''
                  }`}
                />
              </div>
              <p className="text-[10px] text-[#555B50] font-semibold uppercase tracking-wider">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full p-1.5 rounded-xl hover:bg-[#2F3C21] transition-colors">
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'} overflow-hidden flex-1`}>
              <ProfileAvatar user={user} size="sm" showStatus={true} />
              {!isCollapsed && (
                <div className="overflow-hidden text-left flex-1 min-w-0 pr-1">
                  <p className="text-xs font-bold text-white truncate">{user?.fullName || 'User'}</p>
                  <p className="text-[10px] text-[#CAD6B7] truncate">{user?.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#CAD6B7] shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            )}
          </div>
        )}
      </div>

      {/* FLOATING HOVER CARD / POPOVER */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={`absolute ${getPopoverPlacement()} w-[340px] sm:w-[380px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-[#E7E5DA] overflow-hidden z-50 animate-slideDown text-[#242820]`}
          style={{
            boxShadow: '0 20px 35px -5px rgba(36, 40, 32, 0.15), 0 10px 15px -5px rgba(36, 40, 32, 0.08)'
          }}
        >
          {/* 1. PROFILE HEADER BANNER */}
          <div className="bg-gradient-to-r from-[#243629] via-[#344A38] to-[#243629] p-5 text-white relative border-b border-[#3F4D2D]">
            {/* Top Institutional Eyebrow */}
            <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider text-[#CAD6B7]">
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#CAD6B7]" />
                <span>Oakridge Academy</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${meta.badgeClass}`}>
                {meta.badgeText}
              </span>
            </div>

            {/* Avatar & Core Identity */}
            <div className="flex items-start space-x-3.5">
              <ProfileAvatar user={user} size="lg" showStatus={true} ring={true} />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">
                  {user?.fullName || 'Academic User'}
                </h3>
                <p className="text-xs text-[#E4EAD9] font-medium leading-tight mt-0.5">
                  {meta.title}
                </p>

                {/* Email with copy button */}
                <div className="flex items-center space-x-1.5 mt-2 bg-black/20 hover:bg-black/30 transition-colors px-2.5 py-1 rounded-lg w-fit max-w-full">
                  <Mail className="w-3 h-3 text-[#CAD6B7] shrink-0" />
                  <span className="text-[11px] text-[#CAD6B7] truncate">{user?.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    title="Copy registered email"
                    className="p-0.5 hover:text-white text-[#CAD6B7] ml-1 shrink-0"
                  >
                    {copiedEmail ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DYNAMIC IDENTITY & DEPARTMENT PANEL */}
          <div className="p-4 bg-[#F8F7F2] border-b border-[#E7E5DA] space-y-2.5 text-xs">
            {/* ID & Status Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-semibold text-[#555B50]">Unique Identifier:</span>
                <span className="font-mono font-bold text-[#242820] bg-white border border-[#E3E1D6] px-2 py-0.5 rounded text-[11px]">
                  {meta.identifier}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 bg-[#EAF5EC] border border-[#BCE1C5] px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#198754]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#198754] animate-pulse"></span>
                <span>Active</span>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start space-x-2 text-[11px]">
              <span className="text-[#555B50] font-semibold shrink-0">Department:</span>
              <span className="font-bold text-[#242820] truncate">{meta.department}</span>
            </div>

            {/* Role-Specific Detail */}
            <div className="flex items-start space-x-2 text-[11px]">
              <span className="text-[#555B50] font-semibold shrink-0">{meta.detailLabel}:</span>
              <span className="font-bold text-[#242820] truncate">{meta.detailValue}</span>
            </div>

            {/* Mini Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E3E1D6]/70 text-[10px]">
              <div className="flex items-center space-x-1.5 text-[#555B50]">
                <Calendar className="w-3 h-3 text-[#52613B] shrink-0" />
                <span className="truncate">AY 2026-2027</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#555B50]">
                <Clock className="w-3 h-3 text-[#52613B] shrink-0" />
                <span className="truncate">Last login: Today</span>
              </div>
            </div>
          </div>

          {/* 3. QUICK ACTIONS MENU */}
          <div className="p-2 bg-white divide-y divide-[#F0EFE6]">
            <div className="space-y-0.5 pb-1.5">
              {/* 1. View Profile */}
              <button
                onClick={handleViewProfile}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#242820] hover:bg-[#F8F7F2] hover:text-[#52613B] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-bold">View Full Profile</span>
                    <span className="block text-[10px] text-[#555B50] font-normal">
                      Identity & records
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CAD6B7] group-hover:text-[#52613B] transition-colors" />
              </button>

              {/* 2. Account Settings */}
              <button
                onClick={handleAccountSettings}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#242820] hover:bg-[#F8F7F2] hover:text-[#52613B] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-bold">Account Settings</span>
                    <span className="block text-[10px] text-[#555B50] font-normal">
                      System & interface preferences
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CAD6B7] group-hover:text-[#52613B] transition-colors" />
              </button>

              {/* 3. Change Password */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPasswordModal(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#242820] hover:bg-[#F8F7F2] hover:text-[#52613B] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] transition-colors">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-bold">Change Password</span>
                    <span className="block text-[10px] text-[#555B50] font-normal">
                      Update credentials & security
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CAD6B7] group-hover:text-[#52613B] transition-colors" />
              </button>

              {/* 4. Notification Preferences */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowNotificationModal(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#242820] hover:bg-[#F8F7F2] hover:text-[#52613B] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] transition-colors">
                    <BellRing className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-bold">Notification Preferences</span>
                    <span className="block text-[10px] text-[#555B50] font-normal">
                      Alerts & communications
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CAD6B7] group-hover:text-[#52613B] transition-colors" />
              </button>

              {/* 5. Help & Support */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowHelpModal(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#242820] hover:bg-[#F8F7F2] hover:text-[#52613B] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EFE6] group-hover:bg-[#E4EAD9] flex items-center justify-center text-[#52613B] transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-bold">Help & Support</span>
                    <span className="block text-[10px] text-[#555B50] font-normal">
                      IT desk & student guidelines
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CAD6B7] group-hover:text-[#52613B] transition-colors" />
              </button>
            </div>

            {/* 6. Sign Out Button */}
            <div className="pt-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSignOutConfirm(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#DC4545] hover:bg-[#FDECEC] transition-colors group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FDECEC] group-hover:bg-[#F9D2D2] flex items-center justify-center text-[#DC4545] transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>Sign Out</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#DC4545] bg-white border border-[#F9D2D2] px-2 py-0.5 rounded">
                  End Session
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: SIGN OUT */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-[#243629]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E7E5DA] w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] border border-[#F9D2D2] flex items-center justify-center text-[#DC4545] shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#242820]">
                    Sign Out of Oakridge Academy?
                  </h3>
                  <p className="text-xs text-[#555B50] mt-1.5 leading-relaxed">
                    You are signed in as <span className="font-bold text-[#242820]">{user?.fullName}</span> ({user?.email}).
                    Terminating your session will end your active institutional workspace access.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-[#E7E5DA]">
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#555B50] hover:bg-[#F0EFE6] border border-[#E3E1D6] transition-colors"
                >
                  Stay Signed In
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignOut}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#DC4545] hover:bg-red-700 shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Confirm Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#243629]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E7E5DA] w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-4 bg-[#F8F7F2] border-b border-[#E7E5DA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#52613B]" />
                <h3 className="text-sm font-bold text-[#242820]">Change Account Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg hover:bg-[#E3E1D6] text-[#555B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#242820] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52613B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242820] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52613B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242820] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52613B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#E7E5DA]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#555B50] hover:bg-[#F0EFE6] border border-[#E3E1D6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#52613B] hover:bg-[#3F4D2D] shadow-sm disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICATION PREFERENCES */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-[#243629]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E7E5DA] w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-4 bg-[#F8F7F2] border-b border-[#E7E5DA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellRing className="w-4 h-4 text-[#52613B]" />
                <h3 className="text-sm font-bold text-[#242820]">Notification Preferences</h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 rounded-lg hover:bg-[#E3E1D6] text-[#555B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#555B50] leading-relaxed">
                Configure institutional communications and immediate academic event notifications for <span className="font-bold text-[#242820]">{user?.email}</span>.
              </p>

              <div className="space-y-3">
                {[
                  { key: 'academicAlerts', label: 'Academic & Course Announcements', desc: 'Syllabus updates and institutional notices' },
                  { key: 'attendanceAlerts', label: 'Daily Attendance Notifications', desc: 'Real-time alert on roll-call recording' },
                  { key: 'examSchedules', label: 'Assessment & Exam Reminders', desc: 'Milestone notifications 48h before exams' },
                  { key: 'gradePublications', label: 'Grade & Report Card Publications', desc: 'Instant alerts when marks or PDFs are published' },
                  { key: 'emailDigest', label: 'Weekly Summary Digest', desc: 'Consolidated overview sent each Monday morning' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start justify-between p-3 rounded-xl hover:bg-[#F8F7F2] border border-transparent hover:border-[#E3E1D6] cursor-pointer transition-colors">
                    <div className="pr-3">
                      <p className="text-xs font-bold text-[#242820]">{item.label}</p>
                      <p className="text-[10px] text-[#555B50]">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key]}
                      onChange={(e) => setNotifPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="mt-0.5 rounded text-[#52613B] focus:ring-[#52613B]"
                    />
                  </label>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E7E5DA]">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#555B50] hover:bg-[#F0EFE6] border border-[#E3E1D6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationModal(false);
                    toast.success('Notification preferences updated successfully');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#52613B] hover:bg-[#3F4D2D] shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HELP & SUPPORT */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-[#243629]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E7E5DA] w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-4 bg-[#F8F7F2] border-b border-[#E7E5DA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-[#52613B]" />
                <h3 className="text-sm font-bold text-[#242820]">Institutional Help & Support Desk</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-[#E3E1D6] text-[#555B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#EAF5EC] border border-[#BCE1C5] text-xs">
                <p className="font-bold text-[#198754] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Oakridge IT Helpdesk • Active Academic Term</span>
                </p>
                <p className="text-[#344A38] mt-1 leading-relaxed text-[11px]">
                  Need technical assistance or report corrections? Reach out to your designated academic advisor or system administrator.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2]">
                  <p className="font-bold text-[#242820]">Campus Technical Support</p>
                  <p className="text-[#555B50] text-[11px] mt-0.5">Email: support@oakridge.edu | Phone: +1 (555) 234-5678</p>
                  <p className="text-[10px] text-[#52613B] font-semibold mt-1">Available Mon–Fri: 08:00 AM – 06:00 PM EST</p>
                </div>

                <div className="p-3 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2]">
                  <p className="font-bold text-[#242820]">Registrar & Academic Records</p>
                  <p className="text-[#555B50] text-[11px] mt-0.5">Official transcripts, report cards, and enrolment verifications</p>
                  <p className="text-[10px] text-[#52613B] font-semibold mt-1">Email: registrar@oakridge.edu</p>
                </div>

                <div className="p-3 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2]">
                  <p className="font-bold text-[#242820]">Student Guidance & Counseling</p>
                  <p className="text-[#555B50] text-[11px] mt-0.5">Academic counseling, attendance appeals, and faculty liaisons</p>
                  <p className="text-[10px] text-[#52613B] font-semibold mt-1">Office: Building A, Room 204</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-[#E7E5DA]">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#52613B] hover:bg-[#3F4D2D] shadow-sm"
                >
                  Close Help Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;
