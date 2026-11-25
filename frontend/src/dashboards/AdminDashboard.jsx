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
  Sparkles,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity
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
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
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
    staleTime: 20000,
  });

  const COLORS = ['#52613B', '#65774A', '#7B8F5E', '#AAB895', '#CAD6B7', '#D2B66F', '#E4EAD9', '#3F4D2D'];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="card-premium p-6 bg-cream/50 h-28 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
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
      <div className="card-premium p-6 bg-gradient-to-r from-cream/90 via-white to-ivory dark:from-[#1A2417] dark:via-[#182216] dark:to-[#141B12] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6] dark:border-[#283623]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#293526] dark:text-[#C5E8A8] bg-[#E4EAD9] dark:bg-[#23311E] px-2.5 py-0.5 rounded-full border border-[#CAD6B7] dark:border-[#384E30]">
              Enterprise Academic Management
            </span>
            <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-semibold">Active Session: 2026-2027 Fall</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] dark:text-white mt-1.5 tracking-tight">Institutional Executive Command Center</h2>
          <p className="text-xs text-[#555B50] dark:text-[#B5BFAB] font-medium mt-0.5">
            Real-time telemetry and student academic performance powered by Neon Cloud Serverless PostgreSQL.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs flex items-center space-x-2 py-2.5 px-3.5 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#52613B] ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Sync Live Records'}</span>
          </button>
          <Link
            to="/admin/analytics"
            className="btn-primary text-xs flex items-center space-x-2 py-2.5 px-4 font-bold"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Deep Analytics</span>
          </Link>
        </div>
      </div>

      {/* 2. 8 EXECUTIVE ACADEMIC KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          icon={GraduationCap}
          trend="up"
          change="Enrolled active cohort"
        />
        <StatCard
          title="Total Faculty"
          value={data?.totalTeachers || 0}
          icon={Users}
          subtitle="Certified educators"
        />
        <StatCard
          title="Active Classes"
          value={data?.totalClasses || 0}
          icon={Layers}
          subtitle="Accredited sections"
        />
        <StatCard
          title="Curriculum Subjects"
          value={data?.totalSubjects || 0}
          icon={BookOpen}
          subtitle="STEM & Humanities"
        />
        <StatCard
          title="Academic Performance"
          value={`${data?.averagePerformance || 0}%`}
          icon={Award}
          trend={(data?.averagePerformance || 0) >= 75 ? 'up' : 'neutral'}
          change="Cohort grade average"
        />
        <StatCard
          title="Overall Attendance"
          value={`${data?.averageAttendance || 0}%`}
          icon={ClipboardCheck}
          trend={(data?.averageAttendance || 0) >= 80 ? 'up' : 'down'}
          change="Institutional compliance"
        />
        <StatCard
          title="Pending Fee Dues"
          value={`$${Number(data?.pendingFeeCollections || 0).toLocaleString()}`}
          icon={CreditCard}
          trend={Number(data?.pendingFeeCollections || 0) > 0 ? 'down' : 'up'}
          change="Tuition receivable"
        />
        <StatCard
          title="Upcoming Exams"
          value={data?.upcomingExaminationsCount || 2}
          icon={Calendar}
          subtitle="Midterm & finals scheduled"
        />
      </div>

      {/* 3. 4 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Class-Wise Performance */}
        <ChartCard
          title="Class-Wise Academic Performance"
          subtitle="Average percentage scores across active academic levels"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.classWisePerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D6" vertical={false} />
                <XAxis dataKey="className" stroke="#555B50" fontSize={11} tickLine={false} />
                <YAxis stroke="#555B50" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                <Tooltip
                  cursor={{ fill: '#F0EFE6', opacity: 0.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-[#E3E1D6] rounded-xl shadow-card text-xs">
                          <p className="font-bold text-[#242820]">{payload[0].payload.className}</p>
                          <p className="text-[#52613B] font-semibold">Average: {payload[0].value}%</p>
                          <p className="text-[#555B50]">Students: {payload[0].payload.studentCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="averagePercentage" fill="#52613B" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Grade Distribution */}
        <ChartCard
          title="Cohort Grade Distribution"
          subtitle="Evaluation scale breakdown for current academic examinations"
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.gradeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="grade"
                >
                  {(data?.gradeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 border border-[#E3E1D6] rounded-xl shadow-card text-xs">
                          <p className="font-bold text-[#242820]">Grade {payload[0].name}</p>
                          <p className="text-[#52613B] font-semibold">{payload[0].value} Students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-[#242820] font-semibold mr-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3: Monthly Attendance Trends */}
        <ChartCard
          title="Monthly Attendance Trends"
          subtitle="Historical student class attendance rate progression"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyAttendanceTrends || [
                { label: 'Sep', value: 96.5 },
                { label: 'Oct', value: 98.2 },
                { label: 'Nov', value: data?.averageAttendance || 97.2 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52613B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#52613B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D6" vertical={false} />
                <XAxis dataKey="label" stroke="#555B50" fontSize={11} tickLine={false} />
                <YAxis stroke="#555B50" fontSize={11} domain={[80, 100]} tickLine={false} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 border border-[#E3E1D6] rounded-xl shadow-card text-xs">
                          <p className="font-bold text-[#242820]">{payload[0].payload.label}</p>
                          <p className="text-[#52613B] font-semibold">Attendance: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#52613B" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4: Student Enrollment Trends */}
        <ChartCard
          title="Student Enrollment Trends"
          subtitle="Annual admissions and cohort growth trajectory"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.studentEnrollmentTrends || [
                { label: '2024', value: 3 },
                { label: '2025', value: 4 },
                { label: '2026', value: 5 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E1D6" vertical={false} />
                <XAxis dataKey="label" stroke="#555B50" fontSize={11} tickLine={false} />
                <YAxis stroke="#555B50" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 border border-[#E3E1D6] rounded-xl shadow-card text-xs">
                          <p className="font-bold text-[#242820]">Academic Year {payload[0].payload.label}</p>
                          <p className="text-[#52613B] font-semibold">{payload[0].value} Enrolled Students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#65774A" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* 4. PERFORMANCE ROSTER & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Students (2 Cols) */}
        <div className="lg:col-span-2 card-premium overflow-hidden border border-[#E3E1D6]">
          <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#242820]">Top Academic Honor Roll</h3>
              <p className="text-[11px] text-[#555B50] font-medium">Students leading academic evaluations for the current term</p>
            </div>
            <Link to="/admin/students" className="text-xs font-bold text-[#52613B] hover:text-[#3F4D2D] flex items-center space-x-1">
              <span>View Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
              <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E1D6] bg-white">
                {data?.topPerformingStudents?.length > 0 ? (
                  data.topPerformingStudents.map((st, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F7F2] transition-colors">
                      <td className="px-4 py-3 font-bold text-[#242820]">{st.fullName}</td>
                      <td className="px-4 py-3 font-mono text-[#555B50] font-semibold">{st.studentId}</td>
                      <td className="px-4 py-3 text-[#555B50] font-medium">{st.className} - {st.sectionName}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#52613B]">{st.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="olive">{st.grade}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#74796D] font-medium">
                      No evaluation scores available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Institutional Activities (1 Col) */}
        <div className="card-premium p-5 border border-[#E3E1D6] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E1D6]">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#52613B]" />
              <h3 className="text-sm font-bold text-[#242820]">System Activities</h3>
            </div>
            <span className="text-[10px] font-bold text-[#52613B] bg-[#E4EAD9] px-2 py-0.5 rounded-full border border-[#CAD6B7]">
              Live Audit
            </span>
          </div>

          <div className="space-y-3">
            {data?.recentActivities?.map((act) => (
              <div key={act.id} className="p-3 rounded-xl border border-[#E3E1D6] bg-[#F8F7F2] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#242820]">{act.title}</span>
                  <span className="text-[10px] text-[#74796D] font-semibold">2h ago</span>
                </div>
                <p className="text-[11px] text-[#555B50] leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/activity-logs"
              className="w-full btn-secondary text-xs font-bold py-2 flex items-center justify-center space-x-2"
            >
              <span>View Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
