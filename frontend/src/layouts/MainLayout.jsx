import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ title = "Dashboard", subtitle = "Welcome to Student Report System" }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oakridge_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('oakridge_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F2] dark:bg-[#121811] text-[#242820] dark:text-[#E8EDE4] transition-colors duration-200">
      {/* Sidebar with responsive toggle & collapsed state */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Navbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-3 sm:p-6 lg:p-8 flex-1 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
