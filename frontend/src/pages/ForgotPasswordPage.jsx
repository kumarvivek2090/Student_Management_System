import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ShieldAlert, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#52613B] flex items-center justify-center text-white shadow-card mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#242820] font-serif">Password Recovery</h2>
        <p className="mt-1 text-xs text-[#555B50]">Institutional Credential Assistance</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-[#E3E1D6] sm:px-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-[#F0EFE6] text-[#52613B] flex items-center justify-center mx-auto border border-[#E3E1D6]">
            <ShieldAlert className="w-6 h-6 text-[#52613B]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#242820]">Administrator Assisted Recovery</h3>
            <p className="text-xs text-[#555B50] mt-2 leading-relaxed">
              In accordance with institutional security guidelines, automated public email recovery is restricted. Please contact your campus system administrator to reset or re-issue your credentials.
            </p>
          </div>

          <div className="p-3.5 bg-[#F0EFE6] rounded-xl border border-[#E3E1D6] text-xs text-[#242820] space-y-1.5">
            <span className="font-semibold block text-[#242820]">IT Administrative Support:</span>
            <div className="flex items-center justify-center space-x-1.5 text-[#52613B] font-mono text-[11px] font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>admin@studentreport.com</span>
            </div>
            <span className="text-[10px] text-[#74796D] block">Oakridge Academy Academic Administration</span>
          </div>

          <div className="pt-2">
            <Link to="/login" className="w-full py-2.5 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-card transition-all cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
