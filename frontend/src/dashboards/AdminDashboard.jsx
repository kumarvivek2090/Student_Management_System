import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import StatCard from '../components/common/StatCard';
import ChartCard from '../components/common/ChartCard';
import { SkeletonStatCard, SkeletonChart, ErrorState } from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Award,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin/summary');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch executive summary');
    },
    staleTime: 20000, // 20-second cache as per requirements
  });

  const COLORS = ['#69744A', '#8A956E', '#AAB397', '#CCD4BD', '#D4C39B', '#B9A16A', '#D97706', '#DC2626'];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Banner Skeleton */}
        <div className="card-premium p-6 bg-cream/50 h-28 animate-pulse rounded-2xl" />

        {/* 6 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* 2 Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height="h-72" />
          <SkeletonChart height="h-72" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.userMessage || error?.message || 'Could not load institutional dashboard records from Neon PostgreSQL.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER */}
      <div className="card-premium p-6 bg-gradient-to-r from-cream/80 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive-800 bg-olive-100 px-2 py-0.5 rounded-full">
              Institutional Admin
            </span>
            <span className="text-xs text-muted">Term: 2026-2027 Fall</span>
          </div>
          <h2 className="text-xl font-bold text-charcoal mt-1">Institutional Executive Overview</h2>
          <p className="text-xs text-muted mt-0.5">
            Real-time academic performance, attendance distribution, and institutional analytics powered by Neon PostgreSQL.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs shadow-sm flex items-center space-x-1.5"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-olive-600' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <Link to="/marks/entry" className="btn-primary text-xs shadow-sm">
            Enter Marks
          </Link>
          <Link to="/attendance" className="btn-secondary text-xs shadow-sm">
            Record Attendance
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          icon={GraduationCap}
          subtitle="Enrolled cohort"
        />
        <StatCard
          title="Faculty Members"
          value={data?.totalTeachers || 0}
          icon={Users}
          subtitle="Active instructors"
        />
        <StatCard
          title="Academic Classes"
          value={data?.totalClasses || 0}
          icon={Layers}
          subtitle="Active levels"
        />
        <StatCard
          title="Curriculum Subjects"
          value={data?.totalSubjects || 0}
          icon={BookOpen}
          subtitle="Department courses"
        />
        <StatCard
          title="Average Score"
          value={`${data?.averagePerformance ?? data?.averageAcademicPerformance ?? 0}%`}
          icon={Award}
          trend={(data?.averagePerformance ?? data?.averageAcademicPerformance ?? 0) >= 70 ? 'up' : 'down'}
          change="Cohort average"
        />
        <StatCard
          title="Avg Attendance"
          value={`${data?.averageAttendance ?? data?.averageAttendancePercentage ?? 0}%`}
          icon={ClipboardCheck}
          trend={(data?.averageAttendance ?? data?.averageAttendancePercentage ?? 0) >= 75 ? 'up' : 'down'}
          change="Attendance rate"
        />
      </div>

      {/* 3. PRIMARY ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance Comparison */}
        <ChartCard
          title="Class-Wise Academic Performance"
          subtitle="Mean score percentage across grade levels"
        >
          <div className="h-72 w-full">
            {data?.classWisePerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.classWisePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E4D9" vertical={false} />
                  <XAxis dataKey="className" stroke="#77796D" fontSize={11} tickLine={false} />
                  <YAxis stroke="#77796D" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E6E4D9', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [`${val}%`, 'Average Score']}
                  />
                  <Bar dataKey="averagePercentage" fill="#69744A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No examination records available to display.
              </div>
            )}
          </div>
        </ChartCard>

        {/* Grade Distribution */}
        <ChartCard
          title="Overall Grade Distribution"
          subtitle="Student distribution across configured grading scales"
        >
          <div className="h-72 w-full flex items-center justify-center">
            {data?.gradeDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E6E4D9', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val, name, item) => [`${val} students (${item.payload.percentage}%)`, `Grade ${name}`]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#292C24' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted">No grade evaluations recorded yet.</div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* 4. TWO COLUMN: TOP PERFORMERS & STUDENTS RECOMMENDED FOR SUPPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between pb-4 border-b border-warmgrey/70">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-olive-600" />
              <h3 className="text-sm font-semibold text-charcoal">Top Performing Scholars</h3>
            </div>
            <Link to="/reports" className="text-xs text-olive-600 hover:text-olive-700 font-medium inline-flex items-center">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-warmgrey/40 mt-3">
            {data?.topPerformingStudents?.length > 0 ? (
              data.topPerformingStudents.map((st, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-olive-100 text-olive-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-charcoal">{st.fullName}</p>
                      <p className="text-[11px] text-muted">{st.className} - {st.sectionName} | ID: {st.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="olive">{st.grade}</Badge>
                    <p className="text-xs font-bold text-charcoal mt-0.5">{st.percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted py-6 text-center">No student performance data calculated yet.</p>
            )}
          </div>
        </div>

        {/* Support Recommendation */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between pb-4 border-b border-warmgrey/70">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-charcoal">Students Recommended for Support</h3>
            </div>
            <span className="text-[11px] text-muted font-medium">Below cohort average</span>
          </div>
          <div className="divide-y divide-warmgrey/40 mt-3">
            {(data?.studentsNeedingAttention || data?.studentsNeedingImprovement)?.length > 0 ? (
              (data?.studentsNeedingAttention || data?.studentsNeedingImprovement).map((st, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center border border-amber-200">
                      !
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-charcoal">{st.fullName}</p>
                      <p className="text-[11px] text-muted">{st.className} - {st.sectionName} | ID: {st.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{st.grade}</Badge>
                    <p className="text-xs font-bold text-amber-700 mt-0.5">{st.percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted py-6 text-center">
                All evaluated students currently maintain scores above the intervention threshold.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
