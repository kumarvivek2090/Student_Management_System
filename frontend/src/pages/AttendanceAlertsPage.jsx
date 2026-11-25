import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const AttendanceAlertsPage = () => {
  const alerts = [
    {
      id: '1',
      date: '2026-11-20',
      child: 'Sophia Miller',
      class: 'Grade 10-A',
      type: 'LATE_ARRIVAL',
      status: 'LOGGED',
      description: 'Arrived 15 minutes past morning register check for Physics Laboratory session.',
      resolved: true
    },
    {
      id: '2',
      date: '2026-10-15',
      child: 'Sophia Miller',
      class: 'Grade 10-A',
      type: 'EXCUSED_ABSENCE',
      status: 'VERIFIED',
      description: 'Medical certificate accepted by administration for flu recovery.',
      resolved: true
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Guardian Monitoring
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Attendance Thresholds</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Attendance Alerts & Compliance Logs</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Real-time notifications for late arrivals, unexcused session absences, and mandatory 75% attendance threshold tracking.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Compliance"
          value="97.2%"
          icon={CheckCircle2}
          trend="up"
          change="Eligible for examinations"
        />
        <StatCard
          title="Compliance Threshold"
          value="75%"
          icon={ShieldCheck}
          subtitle="Mandatory minimum"
        />
        <StatCard
          title="Active Alerts"
          value="0"
          icon={AlertTriangle}
          trend="up"
          change="All incidents cleared"
        />
      </div>

      {/* Alert Log Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#242820]">Incident & Notification History</h3>
          <span className="text-xs text-[#52613B] font-bold">2 Historical Incidents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Incident Date</th>
                <th className="px-4 py-3.5">Student Child</th>
                <th className="px-4 py-3.5">Incident Category</th>
                <th className="px-4 py-3.5">Administrative Details</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {alerts.map((al) => (
                <tr key={al.id} className="hover:bg-[#F8F7F2] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#242820] flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-[#52613B]" />
                    <span>{al.date}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#242820]">{al.child} ({al.class})</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                      {al.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#555B50] max-w-sm">{al.description}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cleared & Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAlertsPage;
