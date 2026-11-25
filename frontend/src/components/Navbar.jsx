import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Calendar, Check, ExternalLink, X, User } from 'lucide-react';
import api from '../utils/api';

const Navbar = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Quick navigation shortcuts for search
  const searchablePages = [
    { name: 'Dashboard', path: user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard', role: 'ALL' },
    { name: 'Timetable Management', path: '/admin/timetable', role: 'ADMIN' },
    { name: 'Academic Calendar', path: '/admin/calendar', role: 'ADMIN' },
    { name: 'User Management', path: '/admin/users', role: 'ADMIN' },
    { name: 'Fee Management', path: '/admin/fees', role: 'ADMIN' },
    { name: 'Activity Logs', path: '/admin/activity-logs', role: 'ADMIN' },
    { name: 'Database Management', path: '/admin/database', role: 'ADMIN' },
    { name: 'Security & Permissions', path: '/admin/security', role: 'ADMIN' },
    { name: 'Marks Management', path: '/marks/entry', role: 'ALL' },
    { name: 'Attendance Register', path: '/attendance', role: 'ALL' },
    { name: 'Report Cards & PDF', path: '/reports', role: 'ALL' },
    { name: 'Assignments', path: user?.role === 'TEACHER' ? '/teacher/assignments' : '/student/assignments', role: 'ALL' },
    { name: 'My Profile', path: '/student/profile', role: 'STUDENT' },
  ];

  const filteredPages = searchablePages.filter(p =>
    (p.role === 'ALL' || p.role === user?.role) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    } catch (e) {
      // quiet fallback
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data.slice(0, 5));
        }
      } catch (e) {}
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E3E1D6] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-subtle">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-[#F0EFE6] text-[#242820] hover:bg-[#E4EAD9] transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#242820] tracking-tight">{title}</h2>
            {subtitle && <p className="text-[11px] sm:text-xs text-[#555B50] font-medium hidden sm:block -mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Quick Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 bg-[#F8F7F2] hover:bg-[#F0EFE6] border border-[#E3E1D6] text-[#555B50] hover:text-[#242820] px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#52613B]" />
            <span className="hidden md:inline font-medium">Search modules...</span>
            <kbd className="hidden md:inline text-[10px] bg-white border border-[#CAD6B7] px-1.5 py-0.5 rounded text-[#242820] font-mono">⌘K</kbd>
          </button>

          {/* Academic Session Indicator */}
          <div className="hidden md:flex items-center space-x-2 bg-[#F0EFE6] px-3 py-1.5 rounded-full border border-[#CAD6B7] text-xs text-[#242820] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#52613B] animate-pulse"></span>
            <span>Academic Year 2026-2027</span>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="p-2 rounded-lg hover:bg-[#F0EFE6] text-[#242820] transition-colors relative border border-transparent hover:border-[#E3E1D6]"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#242820]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#B84040] text-white text-[9px] font-bold rounded-full border border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-[#E3E1D6] overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 bg-[#F0EFE6] border-b border-[#E3E1D6] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#242820]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#52613B] hover:text-[#3F4D2D] font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#E3E1D6] max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs ${n.isRead ? 'bg-white' : 'bg-[#F8F7F2]'}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#242820]">{n.title}</p>
                          <span className="text-[10px] text-[#74796D]">{n.type}</span>
                        </div>
                        <p className="text-[#555B50] mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#74796D] p-6 text-center font-medium">No new notifications</p>
                  )}
                </div>
                <div className="p-2 bg-[#F8F7F2] border-t border-[#E3E1D6] text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      const targetPath = user?.role === 'ADMIN' ? '/admin/notifications' : user?.role === 'TEACHER' ? '/teacher/notifications' : '/student/notifications';
                      navigate(targetPath);
                    }}
                    className="text-xs text-[#52613B] hover:text-[#3F4D2D] font-bold"
                  >
                    View All Notifications &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-[#E3E1D6]">
            <div className="w-8 h-8 rounded-full bg-[#E4EAD9] border border-[#CAD6B7] text-[#293526] flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#242820] leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-[#555B50] font-semibold uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-forest/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-elevated border border-[#E3E1D6] w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-[#E3E1D6] flex items-center space-x-3 bg-[#F8F7F2]">
              <Search className="w-5 h-5 text-[#52613B]" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to any module or page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#242820] focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg hover:bg-[#E3E1D6] text-[#555B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-[#F0EFE6]">
              {filteredPages.length > 0 ? (
                filteredPages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchQuery('');
                      navigate(p.path);
                    }}
                    className="w-full text-left p-3 hover:bg-[#F0EFE6] rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-bold text-[#242820]">{p.name}</span>
                    <span className="text-[10px] font-mono text-[#52613B] bg-[#E4EAD9] px-2 py-0.5 rounded">
                      {p.path}
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-6 text-center text-xs text-[#74796D] font-medium">No matching modules found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
