import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ChartCard from '../components/common/ChartCard';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
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
  LineChart,
  Line
} from 'recharts';
import { Award, TrendingUp, BookOpen, Layers } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/overview');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating institutional performance trends..." size="lg" />;
  }

  const COLORS = ['#69744A', '#8A956E', '#AAB397', '#CCD4BD', '#D4C39B', '#B9A16A', '#DC2626'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-charcoal">Performance Analytics & Insights</h2>
        <p className="text-xs text-muted">
          Aggregated institutional analytics, cohort trends, subject averages, and grade distributions
        </p>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Cohort Mean Score"
          value={`${data?.averageAcademicPerformance || 0}%`}
          icon={Award}
          subtitle="All examination records"
        />
        <StatCard
          title="Attendance Ratio"
          value={`${data?.averageAttendancePercentage || 0}%`}
          icon={TrendingUp}
          subtitle="Campus presence rate"
        />
        <StatCard
          title="Evaluated Students"
          value={data?.totalStudents || 0}
          icon={Layers}
          subtitle="Active scholars"
        />
        <StatCard
          title="Subjects Assessed"
          value={data?.totalSubjects || 0}
          icon={BookOpen}
          subtitle="Curriculum disciplines"
        />
      </div>

      {/* Chart Row 1: Class Performance & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Class Performance Comparison"
          subtitle="Average academic score (%) achieved by each class cohort"
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
              <div className="h-full flex items-center justify-center text-xs text-muted">No data recorded.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Cohort Grade Distribution"
          subtitle="Student percentage breakdown across letter grades"
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
                    formatter={(val, name, item) => [`${val} scholars (${item.payload.percentage}%)`, `Grade ${name}`]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#292C24' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted">No grades evaluated.</div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Chart Row 2: Subject Averages Table & Pass Rates */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 border-b border-warmgrey/70 bg-cream/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal">Curriculum Subject Performance & Pass Rates</h3>
          <span className="text-xs text-muted font-medium">Standard Passing Threshold: 40%</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-warmgrey/60 text-left text-xs">
            <thead className="bg-cream/60 text-muted font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Subject Code</th>
                <th className="px-4 py-3 text-center">Mean Score (%)</th>
                <th className="px-4 py-3 text-center">Cohort Pass Rate</th>
                <th className="px-4 py-3 text-center">Performance Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgrey/40 bg-white">
              {data?.subjectWiseAverages?.length > 0 ? (
                data.subjectWiseAverages.map((sub, i) => (
                  <tr key={i} className="hover:bg-ivory/50">
                    <td className="px-4 py-3 font-semibold text-charcoal">{sub.subjectName}</td>
                    <td className="px-4 py-3 text-muted">{sub.subjectCode}</td>
                    <td className="px-4 py-3 text-center font-bold text-olive-800">{sub.averageMarks}%</td>
                    <td className="px-4 py-3 text-center font-semibold text-charcoal">{sub.passRate}%</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={sub.averageMarks >= 75 ? 'olive' : sub.averageMarks >= 50 ? 'default' : 'danger'}>
                        {sub.averageMarks >= 75 ? 'Exceeding Targets' : sub.averageMarks >= 50 ? 'Standard Progress' : 'Action Required'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted">
                    No subject exam marks posted yet.
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

export default AnalyticsPage;
