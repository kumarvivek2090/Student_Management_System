import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { SkeletonStatCard, ErrorState } from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import { Award, ClipboardCheck, GraduationCap, Download, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'parent'],
    queryFn: async () => {
      const res = await api.get('/dashboard/parent');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to retrieve guardian dashboard');
    },
    staleTime: 30000,
  });

  const children = data?.children || [];

  const handleDownloadChildPdf = async (child) => {
    if (!child?.studentId) return;
    setDownloadingId(child.studentId);
    try {
      const yId = child.academicYearId || '';
      const sId = child.semesterId || '';
      const response = await api.get(
        `/reports/student/${child.studentId}/pdf?academicYearId=${yId}&semesterId=${sId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ReportCard_${child.studentCode || 'Child'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Official academic report for ${child.fullName} downloaded!`);
    } catch (e) {
      toast.error('Failed to download student report card');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="card-premium p-6 bg-cream/50 h-28 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.userMessage || error?.message || 'Could not load linked student records from Neon.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div className="card-premium p-6 bg-gradient-to-r from-cream/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive-800 bg-olive-100 px-2 py-0.5 rounded-full">
              Guardian Portal
            </span>
            <span className="text-xs text-muted">Authorized Family Access</span>
          </div>
          <h2 className="text-xl font-bold text-forest mt-1.5">Family Academic Overview</h2>
          <p className="text-xs text-muted">
            Welcome, <span className="font-semibold text-charcoal">{data?.parentFullName || user?.fullName}</span>. Track academic trajectories and access certified term report cards.
          </p>
        </div>
      </div>

      {/* 2. LINKED CHILDREN CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal">Enrolled Family Scholars ({children.length})</h3>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child) => (
              <div key={child.studentId} className="card-premium p-6 space-y-5 bg-white border border-warmgrey/80">
                {/* Child Header */}
                <div className="flex items-start justify-between pb-3 border-b border-warmgrey/60">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-olive-800 bg-olive-100 px-2 py-0.5 rounded-full">
                      {child.className} - {child.sectionName}
                    </span>
                    <h4 className="text-base font-bold text-forest mt-1.5">{child.fullName}</h4>
                    <p className="text-[11px] text-muted">
                      ID: <span className="font-mono text-charcoal font-semibold">{child.studentCode}</span> | Roll No: {child.rollNumber}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownloadChildPdf(child)}
                    disabled={downloadingId === child.studentId}
                    className="btn-primary text-xs py-2 px-3 shadow-card flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === child.studentId ? 'Compiling...' : 'PDF Report'}</span>
                  </button>
                </div>

                {/* Child Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-cream/60 p-3 rounded-xl border border-warmgrey/60 text-center">
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider block">Average</span>
                    <span className="text-lg font-bold text-forest mt-0.5 block">{child.overallPercentage}%</span>
                  </div>

                  <div className="bg-cream/60 p-3 rounded-xl border border-warmgrey/60 text-center">
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider block">Grade</span>
                    <span className="text-lg font-bold text-olive-700 mt-0.5 block">{child.currentGrade}</span>
                  </div>

                  <div className="bg-cream/60 p-3 rounded-xl border border-warmgrey/60 text-center">
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider block">Attendance</span>
                    <span className="text-lg font-bold text-forest mt-0.5 block">{child.attendancePercentage}%</span>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-warmgrey/50">
                  <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Term Evaluation Synchronized</span>
                  </span>
                  <span>{child.remarksCount} Teacher Feedback Items</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-premium p-12 text-center bg-white space-y-2">
            <GraduationCap className="w-10 h-10 text-muted mx-auto" />
            <h4 className="text-sm font-bold text-charcoal">No Linked Students Registered</h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Please contact Oakridge Academy IT administration to link your parent profile to your student.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
