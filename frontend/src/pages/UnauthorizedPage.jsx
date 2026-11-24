import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#242820] font-serif">Access Restricted</h1>
      <p className="text-xs text-[#555B50] max-w-md mt-2 leading-relaxed">
        Your current institutional role does not have authorization to view this section. Please navigate back to your permitted dashboard.
      </p>
      <div className="mt-6">
        <Link to="/" className="py-2.5 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
