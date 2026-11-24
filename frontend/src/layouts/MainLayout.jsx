import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ title = "Dashboard", subtitle = "Welcome to Student Report System" }) => {
  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar title={title} subtitle={subtitle} />
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
