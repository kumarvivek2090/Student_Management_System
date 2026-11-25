import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { SkeletonStatCard, SkeletonTable, ErrorState } from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import {
  Award,
  ClipboardCheck,
  BookOpen,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Clock,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to retrieve academic records');
    },
    staleTime: 20000,
  });

  const handleDownloadPdf = async () => {
    if (!data?.studentId) return;
    setDownloading(true);
    try {
      const yId = data.academicYearId || '';
      const sId = data.semesterId || '';
      const response = await api.get(
        `/reports/student/${data.studentId}/pdf?academicYearId=${yId}&semesterId=${sId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Academic_Report_${data.studentCode || 'Student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official academic report card downloaded!');
    } catch (e) {
      toast.error('Failed to download report PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="card-premium p-6 bg-cream/50 h-28 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={4} cols={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.userMessage || error?.message || 'Could not retrieve your academic records from Neon.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. STUDENT BANNER */}
      <div className="card-premium p-6 bg-gradient-to-r from-cream/80 to-white dark:from-[#1A2417] dark:to-[#182216] border border-[#E3E1D6] dark:border-[#283623] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-olive-800 dark:text-[#BCE39C] bg-olive-100 dark:bg-[#23311E] px-2.5 py-0.5 rounded-full">
              {data?.className || 'Grade'} - {data?.sectionName || 'Section'}
            </span>
            <span className="text-xs text-muted dark:text-[#CAD6B7]">Roll No: {data?.rollNumber}</span>
          </div>
          <h2 className="text-xl font-bold text-forest dark:text-white mt-1.5">{data?.fullName || user?.fullName}</h2>
          <p className="text-xs text-muted dark:text-[#B5BFAB]">
            Student ID: <span className="font-mono text-charcoal dark:text-white font-semibold">{data?.studentCode}</span> | Term: {data?.academicYearName} ({data?.semesterName})
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="btn-primary text-xs shadow-card flex items-center space-x-2 self-start sm:self-auto py-2.5 px-4"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generating PDF...' : 'Download Official Report PDF'}</span>
        </button>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${data?.overallPercentage || 0}%`}
          icon={Award}
          trend={(data?.overallPercentage || 0) >= 70 ? 'up' : 'neutral'}
          change="Cumulative score"
        />
        <StatCard
          title="Academic Grade"
          value={data?.currentGrade || 'N/A'}
          icon={BookOpen}
          subtitle="Evaluation scale"
        />
        <StatCard
          title="Attendance Rate"
          value={`${data?.attendancePercentage || 0}%`}
          icon={ClipboardCheck}
          trend={(data?.attendancePercentage || 0) >= 75 ? 'up' : 'down'}
          change="Class attendance"
        />
        <StatCard
          title="Enrolled Courses"
          value={data?.totalSubjects || 0}
          icon={FileText}
          subtitle="Curriculum subjects"
        />
      </div>

      {/* 3. COURSE PERFORMANCE TABLE */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 border-b border-warmgrey/70 bg-cream/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Course Performance & Marks Breakdown</h3>
            <p className="text-[11px] text-muted">Official evaluation marks recorded in Neon PostgreSQL</p>
          </div>
          <span className="text-xs text-muted font-medium">{data?.semesterName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-warmgrey/60 text-left text-xs">
            <thead className="bg-cream/60 text-muted font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Course Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3 text-center">Max Marks</th>
                <th className="px-4 py-3 text-center">Marks Obtained</th>
                <th className="px-4 py-3 text-center">Percentage</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgrey/40 bg-white">
              {data?.subjects?.length > 0 ? (
                data.subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-ivory/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-charcoal">{sub.subjectName}</td>
                    <td className="px-4 py-3 text-muted font-mono">{sub.subjectCode}</td>
                    <td className="px-4 py-3 text-center text-charcoal">{sub.maxMarks}</td>
                    <td className="px-4 py-3 text-center font-bold text-forest">{sub.obtainedMarks}</td>
                    <td className="px-4 py-3 text-center font-bold text-olive-700">{sub.percentage}%</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="olive">{sub.grade}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Satisfied
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted">
                    No examination marks entered yet for the current term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TWO COLUMN: RECENT ATTENDANCE & TEACHER REMARKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-warmgrey/70">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-olive-600" />
              <h3 className="text-sm font-semibold text-charcoal">Recent Attendance Register</h3>
            </div>
            <span className="text-xs text-muted font-medium">{data?.attendancePercentage}% Compliance</span>
          </div>

          <div className="divide-y divide-warmgrey/40">
            {data?.recentAttendance?.length > 0 ? (
              data.recentAttendance.map((att, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span className="font-medium text-charcoal">{att.date}</span>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : att.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted py-4 text-center">No recent attendance sessions logged.</p>
            )}
          </div>
        </div>

        {/* Teacher Remarks */}
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-warmgrey/70">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-olive-600" />
              <h3 className="text-sm font-semibold text-charcoal">Faculty Commendations & Feedback</h3>
            </div>
            <span className="text-xs text-muted font-medium">{data?.remarks?.length || 0} Remarks</span>
          </div>

          <div className="space-y-3">
            {data?.remarks?.length > 0 ? (
              data.remarks.map((rem, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-warmgrey bg-cream/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-forest">
                      {rem.teacherName} <span className="text-muted font-normal text-[11px]">({rem.subjectName})</span>
                    </span>
                    <Badge variant="sage">{rem.category}</Badge>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">{rem.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted py-6 text-center">No teacher remarks published for this term yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
