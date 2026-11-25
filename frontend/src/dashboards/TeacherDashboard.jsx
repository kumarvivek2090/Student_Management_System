import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { SkeletonStatCard, ErrorState } from '../components/common/Skeleton';
import { Link } from 'react-router-dom';
import { Layers, BookOpen, Award, ClipboardCheck, MessageSquare, ArrowRight, Users, CheckCircle2 } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: async () => {
      const res = await api.get('/dashboard/teacher');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to retrieve faculty dashboard');
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="card-premium p-6 bg-cream/50 h-28 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.userMessage || error?.message || 'Could not load instructor workspace from Neon.'}
        onRetry={() => refetch()}
      />
    );
  }

  const assignedClasses = data?.assignedClasses || [];

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div className="card-premium p-6 bg-gradient-to-r from-cream/70 to-white dark:from-[#1A2417] dark:to-[#182216] border border-[#E3E1D6] dark:border-[#283623] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive-800 dark:text-[#BCE39C] bg-olive-100 dark:bg-[#23311E] px-2 py-0.5 rounded-full">
              Faculty Instructor
            </span>
            <span className="text-xs text-muted dark:text-[#CAD6B7]">ID: {data?.teacherCode}</span>
          </div>
          <h2 className="text-xl font-bold text-forest dark:text-white mt-1.5">Instructor Portal</h2>
          <p className="text-xs text-muted dark:text-[#B5BFAB]">
            Welcome back, <span className="font-semibold text-charcoal dark:text-white">{data?.fullName || user?.fullName}</span>. Department: {data?.specialization || 'Academic Faculty'}.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/marks/entry" className="btn-primary text-xs shadow-card">
            Enter Marks
          </Link>
          <Link to="/attendance" className="btn-secondary text-xs shadow-sm">
            Take Attendance
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={data?.totalAssignedClasses || 0}
          icon={Layers}
          subtitle="Academic cohorts"
        />
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          icon={Users}
          subtitle="Enrolled scholars"
        />
        <StatCard
          title="Remarks Published"
          value={data?.totalRemarksGiven || 0}
          icon={MessageSquare}
          subtitle="Evaluations posted"
        />
        <StatCard
          title="Evaluation Workflow"
          value="Active"
          icon={Award}
          subtitle="Neon synchronized"
        />
      </div>

      {/* 3. ASSIGNED CLASSES */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-warmgrey/70">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Assigned Teaching Responsibilities</h3>
            <p className="text-[11px] text-muted">Cohorts registered to your faculty profile in Neon PostgreSQL</p>
          </div>
          <Link to="/marks/entry" className="text-xs text-olive-700 hover:text-olive-900 font-semibold inline-flex items-center space-x-1">
            <span>Marks Entry Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {assignedClasses.length > 0 ? (
            assignedClasses.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-warmgrey bg-cream/30 hover:border-olive-400 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest">
                    {item.className} ({item.sectionName})
                  </span>
                  <span className="text-[10px] font-semibold text-olive-700 bg-olive-100 px-2 py-0.5 rounded-full">
                    {item.studentCount} Students
                  </span>
                </div>

                <div className="text-xs text-muted">
                  <span className="block font-medium text-charcoal mb-0.5">Subject:</span>
                  <p className="font-mono text-[11px] text-olive-800">
                    {item.subjectsTaught?.join(', ') || 'General Studies'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-warmgrey/50">
                  <Link
                    to="/marks/entry"
                    className="text-[11px] font-semibold text-olive-700 hover:text-olive-900"
                  >
                    Enter Marks →
                  </Link>
                  <Link
                    to="/attendance"
                    className="text-[11px] font-semibold text-muted hover:text-charcoal"
                  >
                    Attendance →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-muted">
              No specific classes allocated yet. Contact the institutional administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
