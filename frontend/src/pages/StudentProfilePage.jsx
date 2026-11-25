import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { GraduationCap, Mail, Phone, Calendar, MapPin, Users, ShieldCheck, Award, FileText } from 'lucide-react';
import Badge from '../components/common/Badge';

const StudentProfilePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data?.data;
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-[#555B50]">Loading profile records...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#52613B] text-white flex items-center justify-center font-bold text-2xl shadow-md border border-[#7B8F5E]">
            {data?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
                Enrolled Student
              </span>
              <span className="text-xs text-[#555B50] font-semibold">ID: {data?.studentCode}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#242820] mt-1 tracking-tight">{data?.fullName}</h2>
            <p className="text-xs text-[#555B50] font-medium">{data?.className} • Section {data?.sectionName} | Roll Number: {data?.rollNumber}</p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Profile */}
        <div className="card-premium p-6 border border-[#E3E1D6] space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E1D6]">
            <GraduationCap className="w-4 h-4 text-[#52613B]" />
            <h3 className="text-sm font-bold text-[#242820]">Institutional Academic Enrollment</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Official Student ID:</span>
              <span className="font-mono font-bold text-[#242820]">{data?.studentCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Class & Section:</span>
              <span className="font-bold text-[#242820]">{data?.className} - {data?.sectionName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Roll Number:</span>
              <span className="font-bold text-[#52613B]">{data?.rollNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Current Academic Term:</span>
              <span className="font-bold text-[#242820]">{data?.academicYearName} ({data?.semesterName})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Cumulative Grade Standing:</span>
              <Badge variant="olive">{data?.currentGrade}</Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#555B50] font-semibold">Attendance Compliance:</span>
              <span className="font-bold text-emerald-700">{data?.attendancePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Contact & Guardian Details */}
        <div className="card-premium p-6 border border-[#E3E1D6] space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E1D6]">
            <Users className="w-4 h-4 text-[#52613B]" />
            <h3 className="text-sm font-bold text-[#242820]">Contact & Guardian Information</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Student Institutional Email:</span>
              <span className="font-mono text-[#242820]">{data?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Guardian / Primary Contact:</span>
              <span className="font-bold text-[#242820]">Official Institutional File</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Campus Location:</span>
              <span className="font-medium text-[#242820]">Oakridge Academy Cambridge Campus</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
              <span className="text-[#555B50] font-semibold">Security Credential Status:</span>
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Active</span>
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#555B50] font-semibold">Account Status:</span>
              <Badge variant="olive">ACTIVE</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
