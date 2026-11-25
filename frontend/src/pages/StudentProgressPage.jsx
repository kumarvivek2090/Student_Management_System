import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { TrendingUp, Users, Award, AlertTriangle, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const StudentProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/admin/summary');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load student progress analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Academic Diagnostics
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Cohort Longitudinal Tracking</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Student Progress & Learning Analytics</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Identify student mastery trends, academic standing, and pinpoint learners requiring faculty intervention.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Class Average"
          value={`${data?.averagePerformance || 0}%`}
          icon={Award}
          trend={(data?.averagePerformance || 0) >= 75 ? 'up' : 'neutral'}
          change="Cohort examination benchmark"
        />
        <StatCard
          title="Attendance Rate"
          value={`${data?.averageAttendance || 0}%`}
          icon={CheckCircle2}
          trend="up"
          change="Instructional engagement"
        />
        <StatCard
          title="Top Achievers"
          value={data?.topPerformingStudents?.length || 0}
          icon={TrendingUp}
          subtitle="Grade A & A+ standing"
        />
        <StatCard
          title="Intervention Required"
          value={data?.studentsNeedingAttention?.length || 0}
          icon={AlertTriangle}
          trend="down"
          change="Targeted mentoring advised"
        />
      </div>

      {/* Two Column Tables: Honor Roll vs Attention Needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Honor Roll */}
        <div className="card-premium overflow-hidden border border-[#E3E1D6]">
          <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#242820]">High Academic Mastery</h3>
            <span className="text-xs text-[#52613B] font-bold">Top Cohort</span>
          </div>
          <div className="divide-y divide-[#E3E1D6] p-2 max-h-80 overflow-y-auto">
            {data?.topPerformingStudents?.map((st, idx) => (
              <div key={idx} className="p-3 hover:bg-[#F8F7F2] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#242820]">{st.fullName}</p>
                  <p className="text-[11px] text-[#555B50]">Roll: {st.studentId} • {st.className} ({st.sectionName})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#52613B]">{st.percentage}%</p>
                  <Badge variant="olive">{st.grade}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Needed */}
        <div className="card-premium overflow-hidden border border-[#E3E1D6]">
          <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#242820]">Learners Needing Academic Mentorship</h3>
            <span className="text-xs text-[#B84040] font-bold">Support Target</span>
          </div>
          <div className="divide-y divide-[#E3E1D6] p-2 max-h-80 overflow-y-auto">
            {data?.studentsNeedingAttention?.map((st, idx) => (
              <div key={idx} className="p-3 hover:bg-[#F8F7F2] transition-colors rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#242820]">{st.fullName}</p>
                  <p className="text-[11px] text-[#555B50]">Roll: {st.studentId} • {st.className} ({st.sectionName})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#B84040]">{st.percentage}%</p>
                  <Badge variant="gold">{st.grade}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;
