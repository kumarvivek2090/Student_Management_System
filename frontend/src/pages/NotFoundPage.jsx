import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F0EFE6] border border-[#E3E1D6] flex items-center justify-center text-[#555B50] mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#242820] font-serif">404</h1>
      <h2 className="text-sm font-semibold text-[#242820] mt-1">Resource Not Found</h2>
      <p className="text-xs text-[#555B50] max-w-sm mt-1.5 leading-relaxed">
        The requested page or resource could not be found on this academic portal.
      </p>
      <div className="mt-6">
        <Link to="/" className="py-2.5 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
