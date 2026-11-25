import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { ClipboardCheck, Calendar, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const StudentAttendancePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data?.data;
    }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Compliance Register
            </span>
            <span className="text-xs text-[#555B50] font-semibold">{data?.academicYearName} Term</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">My Daily Attendance & Compliance Log</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Verified attendance records logged during instructional classroom and laboratory sessions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${data?.attendancePercentage || 100}%`}
          icon={ClipboardCheck}
          trend={(data?.attendancePercentage || 100) >= 80 ? 'up' : 'down'}
          change="Institutional compliance"
        />
        <StatCard
          title="Minimum Requirement"
          value="75%"
          icon={ShieldCheck}
          subtitle="Examination eligibility threshold"
        />
        <StatCard
          title="Logged Sessions"
          value={data?.recentAttendance?.length || 0}
          icon={Calendar}
          subtitle="Recorded classroom checks"
        />
        <StatCard
          title="Compliance Standing"
          value={(data?.attendancePercentage || 100) >= 75 ? 'Compliant' : 'At Risk'}
          icon={CheckCircle2}
          trend="up"
          change="Eligible for examinations"
        />
      </div>

      {/* Attendance History Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#242820]">Session Attendance Register</h3>
            <p className="text-[11px] text-[#555B50] font-medium">Daily register entries recorded by faculty</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded border border-[#CAD6B7]">
            Compliance: {data?.attendancePercentage}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Session Date</th>
                <th className="px-4 py-3.5">Cohort Class</th>
                <th className="px-4 py-3.5">Attendance Status</th>
                <th className="px-4 py-3.5">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {data?.recentAttendance?.length > 0 ? (
                data.recentAttendance.map((att, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#242820] flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-[#52613B]" />
                      <span>{att.date}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] font-medium">{data?.className} - {data?.sectionName}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : att.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] font-medium">{att.remarks || 'Recorded present on time.'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No session logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
