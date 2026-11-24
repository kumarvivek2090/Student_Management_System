import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ShieldCheck } from 'lucide-react';

const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-warmgrey/70 flex items-center justify-between px-8 sticky top-0 z-20 shadow-subtle">
      <div>
        <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
        {subtitle && <p className="text-xs text-muted -mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Academic Session Indicator */}
        <div className="hidden sm:flex items-center space-x-2 bg-cream px-3 py-1.5 rounded-full border border-warmgrey text-xs text-charcoal">
          <span className="w-2 h-2 rounded-full bg-olive-500"></span>
          <span className="font-medium">Academic Year 2026-2027</span>
        </div>

        {/* Notifications Icon */}
        <button className="p-2 rounded-full hover:bg-cream text-muted hover:text-charcoal transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-olive-500 rounded-full"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-warmgrey">
          <div className="w-8 h-8 rounded-full bg-olive-100 border border-olive-200 text-olive-800 flex items-center justify-center font-semibold text-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-charcoal">{user?.fullName}</p>
            <p className="text-[10px] text-muted capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
