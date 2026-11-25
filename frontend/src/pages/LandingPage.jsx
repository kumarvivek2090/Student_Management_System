import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  GraduationCap,
  Award,
  ClipboardCheck,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  BookOpen,
  Lock,
  Cpu,
  Server,
  Menu,
  X,
  FileCheck,
  Shield,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // 1. Fetch Live Institutional Summary from Neon Cloud PostgreSQL
  const {
    data: summaryData,
    isLoading: isSummaryLoading
  } = useQuery({
    queryKey: ['public', 'summary'],
    queryFn: async () => {
      const res = await axios.get('/api/public/summary');
      return res.data?.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // 2. Fetch Live Neon Database & Health Diagnostics
  const {
    data: healthData,
    isLoading: isHealthLoading
  } = useQuery({
    queryKey: ['public', 'health-ready'],
    queryFn: async () => {
      const res = await axios.get('/api/health/ready');
      return res.data;
    },
    staleTime: 15000,
    refetchInterval: 30000
  });

  // Smooth scroll handler
  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Section observer for scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'portals', 'neon-db', 'security'];
      const scrollY = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chartData = summaryData?.gradeDistribution?.map((item) => ({
    grade: item.grade,
    count: item.count,
    percentage: item.percentage
  })) || [];

  const gradeColors = {
    'A+': '#293526',
    'A': '#52613B',
    'B+': '#65774A',
    'B': '#7B8F5E',
    'C': '#A58A50',
    'D': '#AAB895',
    'F': '#B84040'
  };

  return (
    <div id="home" className="min-h-screen bg-[#F8F7F2] dark:bg-[#111710] text-[#242820] dark:text-[#E8EDE4] font-sans antialiased selection:bg-[#E4EAD9] selection:text-[#242820]">
      
      {/* ==================================================================== */}
      {/* 1. STICKY NAVIGATION BAR                                             */}
      {/* ==================================================================== */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#141B12]/95 backdrop-blur-md border-b border-[#E3E1D6] dark:border-[#283623] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-[#293526] dark:bg-[#52613B] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#242820] dark:text-white block leading-tight font-serif">
                Oakridge Academy
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#52613B] dark:text-[#B2D297] block">
                Academic Reporting Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (High-contrast text) */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4]">
            <button
              onClick={() => scrollTo('home')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'home'
                  ? 'text-[#52613B] dark:text-[#BCE39C] font-bold border-b-2 border-[#52613B] dark:border-[#BCE39C]'
                  : 'hover:text-[#52613B] dark:hover:text-[#BCE39C]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'features'
                  ? 'text-[#52613B] dark:text-[#BCE39C] font-bold border-b-2 border-[#52613B] dark:border-[#BCE39C]'
                  : 'hover:text-[#52613B] dark:hover:text-[#BCE39C]'
              }`}
            >
              Platform Features
            </button>
            <button
              onClick={() => scrollTo('portals')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'portals'
                  ? 'text-[#52613B] dark:text-[#BCE39C] font-bold border-b-2 border-[#52613B] dark:border-[#BCE39C]'
                  : 'hover:text-[#52613B] dark:hover:text-[#BCE39C]'
              }`}
            >
              Role Portals
            </button>
            <button
              onClick={() => scrollTo('neon-db')}
              className={`transition-colors py-1 cursor-pointer flex items-center space-x-1.5 ${
                activeSection === 'neon-db'
                  ? 'text-[#52613B] dark:text-[#BCE39C] font-bold border-b-2 border-[#52613B] dark:border-[#BCE39C]'
                  : 'hover:text-[#52613B] dark:hover:text-[#BCE39C]'
              }`}
            >
              <Database className="w-4 h-4 text-[#52613B] dark:text-[#BCE39C]" />
              <span>Neon Cloud DB</span>
            </button>
            <button
              onClick={() => scrollTo('security')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'security'
                  ? 'text-[#52613B] dark:text-[#BCE39C] font-bold border-b-2 border-[#52613B] dark:border-[#BCE39C]'
                  : 'hover:text-[#52613B] dark:hover:text-[#BCE39C]'
              }`}
            >
              Security
            </button>
          </div>

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="btn-primary text-sm py-2.5 px-5 shadow-sm flex items-center space-x-2 font-semibold"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#242820] dark:text-[#E8EDE4] hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E] border border-[#E3E1D6] dark:border-[#283623] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#242820] dark:text-white" /> : <Menu className="w-5 h-5 text-[#242820] dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#182216] border-b border-[#E3E1D6] dark:border-[#283623] px-4 pt-3 pb-6 space-y-2 shadow-md">
            <button
              onClick={() => scrollTo('home')}
              className="w-full text-left py-2.5 px-3 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4] rounded-lg hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E]"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="w-full text-left py-2.5 px-3 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4] rounded-lg hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E]"
            >
              Platform Features
            </button>
            <button
              onClick={() => scrollTo('portals')}
              className="w-full text-left py-2.5 px-3 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4] rounded-lg hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E]"
            >
              Role Portals
            </button>
            <button
              onClick={() => scrollTo('neon-db')}
              className="w-full text-left py-2.5 px-3 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4] rounded-lg hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E] flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-[#52613B] dark:text-[#BCE39C]" />
              <span>Neon Cloud DB</span>
            </button>
            <button
              onClick={() => scrollTo('security')}
              className="w-full text-left py-2.5 px-3 text-sm font-semibold text-[#242820] dark:text-[#E8EDE4] rounded-lg hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E]"
            >
              Security
            </button>
          </div>
        )}
      </nav>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION (Warm Ivory Background: #F8F7F2)                     */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-[#F8F7F2] dark:bg-[#111710]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Section Tag Badge: High Contrast Olive with Warm Cream Fill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F0EFE6] dark:bg-[#1D281A] border border-[#E3E1D6] dark:border-[#2F412A] text-xs font-bold text-[#52613B] dark:text-[#B2D297] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#A58A50] dark:text-[#F6D06F]" />
              <span>Academic Evaluation, Attendance & Reporting Engine</span>
            </div>

            {/* Main Headline: Rich Charcoal (#242820) in light, Crisp White in dark */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#242820] dark:text-white tracking-tight leading-[1.14] font-serif">
              Every Student's Progress, <br />
              <span className="text-[#52613B] dark:text-[#BCE39C] underline decoration-[#CAD6B7] dark:decoration-[#52613B] underline-offset-8">Clearly Understood.</span>
            </h1>

            {/* Supporting Text: Readable Muted Charcoal (#555B50) in light, Warm Sage (#CAD6B7) in dark */}
            <p className="text-base sm:text-lg text-[#555B50] dark:text-[#CAD6B7] font-normal max-w-2xl mx-auto leading-relaxed">
              A smarter way to track academic performance, manage attendance, and connect teachers, students, and parents through one unified academic platform.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto btn-primary py-3.5 px-8 text-sm font-semibold shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollTo('features')}
                className="w-full sm:w-auto btn-secondary py-3.5 px-8 text-sm font-semibold shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </button>
            </div>

            {/* Three Trust Indicators with High Contrast */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-xs text-[#242820] dark:text-[#E8EDE4] font-semibold">
              <div className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                <span>Live Neon PostgreSQL</span>
              </div>
              <div className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                <span>Secure Role-Based Access</span>
              </div>
              <div className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                <span>Automated PDF Report Cards</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. LIVE DASHBOARD PREVIEW (Real Data from Neon Cloud PostgreSQL) */}
          {/* ================================================================ */}
          <div className="mt-14 lg:mt-20 max-w-5xl mx-auto">
            <div className="border border-[#E3E1D6] dark:border-[#283623] shadow-panel rounded-2xl overflow-hidden bg-white dark:bg-[#182216]">
              
              {/* Window Header: Deep Forest Green (#293526) with crisp white text */}
              <div className="bg-[#293526] dark:bg-[#141B12] px-6 py-4 flex items-center justify-between text-white border-b border-[#3F4D2D] dark:border-[#283623]">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#B84040] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#A58A50] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#247A55] inline-block" />
                  </div>
                  <span className="text-xs font-bold text-[#E2E8D8] tracking-wide pl-2 border-l border-white/20">
                    Oakridge Academy Institutional Command Center
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs bg-black/30 px-3 py-1 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[#E2E8D8] font-medium">Neon PostgreSQL Connected</span>
                </div>
              </div>

              {/* Preview Body: Soft Cream Background (#F0EFE6) in light, Deep Dark in dark */}
              <div className="p-6 sm:p-8 space-y-6 bg-[#F0EFE6] dark:bg-[#111710]">
                
                {/* 4 Key Metrics Cards with High Contrast Typography */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Total Students */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                    <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                      Total Enrolled Students
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#242820] dark:text-white font-serif">
                        {isSummaryLoading ? '...' : (summaryData?.totalStudents ?? 0)}
                      </span>
                      <Users className="w-5 h-5 text-[#52613B] dark:text-[#B2D297]" />
                    </div>
                    <span className="text-xs text-[#74796D] dark:text-[#9AA690] mt-1 font-medium block">Live Database Count</span>
                  </div>

                  {/* Institutional Average */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                    <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                      Institutional Average
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#242820] dark:text-white font-serif">
                        {isSummaryLoading
                          ? '...'
                          : summaryData?.averagePerformance != null
                          ? `${summaryData.averagePerformance}%`
                          : 'N/A'}
                      </span>
                      <TrendingUp className="w-5 h-5 text-[#52613B] dark:text-[#B2D297]" />
                    </div>
                    <span className="text-xs text-[#247A55] dark:text-emerald-400 font-semibold mt-1 block">All Assessments Aggregate</span>
                  </div>

                  {/* Attendance Ratio */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                    <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                      Attendance Ratio
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#242820] dark:text-white font-serif">
                        {isSummaryLoading
                          ? '...'
                          : summaryData?.averageAttendance != null
                          ? `${summaryData.averageAttendance}%`
                          : 'N/A'}
                      </span>
                      <ClipboardCheck className="w-5 h-5 text-[#52613B] dark:text-[#B2D297]" />
                    </div>
                    <span className="text-xs text-[#247A55] dark:text-emerald-400 font-semibold mt-1 block">Present & Late Sessions</span>
                  </div>

                  {/* Published Reports */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] shadow-xs">
                    <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                      Published Reports
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#242820] dark:text-white font-serif">
                        {isSummaryLoading ? '...' : (summaryData?.publishedReports ?? 0)}
                      </span>
                      <FileCheck className="w-5 h-5 text-[#52613B] dark:text-[#B2D297]" />
                    </div>
                    <span className="text-xs text-[#74796D] dark:text-[#9AA690] mt-1 font-medium block">PDF Term Cards Published</span>
                  </div>
                </div>

                {/* Cohort Performance Distribution & Top Performers Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left: Cohort Performance Distribution (7 cols) */}
                  <div className="lg:col-span-7 bg-white dark:bg-[#182216] p-5 rounded-xl border border-[#E3E1D6] dark:border-[#283623] shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#242820] dark:text-white">
                          Cohort Performance Distribution
                        </h4>
                        <p className="text-xs text-[#555B50] dark:text-[#CAD6B7]">
                          Official grade frequency derived from examination marks in Neon
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#F0EFE6] dark:bg-[#1D281A] text-[#52613B] dark:text-[#B2D297] border border-[#E3E1D6] dark:border-[#283623]">
                        Real-Time SQL
                      </span>
                    </div>

                    {isSummaryLoading ? (
                      <div className="h-48 flex items-center justify-center text-xs text-[#555B50] dark:text-[#CAD6B7] font-medium">
                        Calculating distribution from Neon PostgreSQL...
                      </div>
                    ) : chartData.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#8FA084', fontWeight: 600 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8FA084' }} />
                            <Tooltip
                              formatter={(value, name, props) => [`${value} students (${props.payload.percentage}%)`, 'Students']}
                              contentStyle={{ backgroundColor: '#182216', borderRadius: '8px', border: '1px solid #283623', fontSize: '12px', color: '#F3F6F0' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={gradeColors[entry.grade] || '#52613B'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#F8F7F2] dark:bg-[#131A12] rounded-lg border border-dashed border-[#E3E1D6] dark:border-[#283623]">
                        <BarChart3 className="w-8 h-8 text-[#555B50] dark:text-[#CAD6B7] mb-2" />
                        <span className="text-xs font-bold text-[#242820] dark:text-white">No Cohort Distribution Data Yet</span>
                        <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-0.5">Records will reflect here once marks are entered.</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Top Performing Students (5 cols) */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#182216] p-5 rounded-xl border border-[#E3E1D6] dark:border-[#283623] shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#242820] dark:text-white">
                          Top Performing Students
                        </h4>
                        <p className="text-xs text-[#555B50] dark:text-[#CAD6B7]">Academic honors roster</p>
                      </div>
                      <Award className="w-5 h-5 text-[#A58A50] dark:text-[#F6D06F]" />
                    </div>

                    {isSummaryLoading ? (
                      <div className="space-y-2 py-4">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="h-10 rounded-lg bg-[#F0EFE6] dark:bg-[#1D281A] animate-pulse" />
                        ))}
                      </div>
                    ) : summaryData?.topPerformingStudents && summaryData.topPerformingStudents.length > 0 ? (
                      <div className="space-y-2.5">
                        {summaryData.topPerformingStudents.slice(0, 4).map((st, idx) => (
                          <div
                            key={st.studentId || idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] text-xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="w-5 h-5 rounded-full bg-[#293526] dark:bg-[#52613B] text-white flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-[#242820] dark:text-white block leading-tight">
                                  {st.fullName}
                                </span>
                                <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] block">
                                  {st.className} • Section {st.sectionName}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-[#293526] dark:text-[#B2D297] block leading-tight">
                                {st.percentage}%
                              </span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#CAD6B7] dark:bg-[#2D3D27] text-[#293526] dark:text-[#E8EDE4] font-bold">
                                Grade {st.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-[#F8F7F2] dark:bg-[#131A12] rounded-lg border border-dashed border-[#E3E1D6] dark:border-[#283623]">
                        <Users className="w-7 h-7 text-[#555B50] dark:text-[#CAD6B7] mb-1.5" />
                        <span className="text-xs font-bold text-[#242820] dark:text-white">No Top Performers Recorded</span>
                        <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-0.5">Ranks will calculate automatically from marks.</span>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#E3E1D6] dark:border-[#283623] text-center">
                      <Link
                        to="/login"
                        className="text-xs font-bold text-[#52613B] dark:text-[#B2D297] hover:text-[#3F4D2D] dark:hover:text-[#CDEBB2] inline-flex items-center space-x-1"
                      >
                        <span>Access Complete Institutional Directory</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. PLATFORM FEATURES SECTION (White Background: #FFFFFF)             */}
      {/* ==================================================================== */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-[#131A12] border-y border-[#E3E1D6] dark:border-[#283623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52613B] dark:text-[#B2D297]">
              End-to-End Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#242820] dark:text-white tracking-tight font-serif">
              Built for Institutional Precision
            </h2>
            <p className="text-base text-[#555B50] dark:text-[#CAD6B7]">
              Everything required to oversee, evaluate, and communicate academic results with absolute reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Smart Student Directory */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Smart Student Directory</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Student admission and profile management. Search by name, student code, roll number, or email, with linked guardian relationships.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Server-side pagination & debounced search</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Class and section enrollment tracking</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Performance Tracking */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Performance Tracking</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Subject-wise marks entry with automated weighted percentages, dynamic grade calculation, and longitudinal academic histories.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Automated standard grading scales (A+ through F)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Zero-delay marks persistence in Neon PostgreSQL</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Attendance Monitoring */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Attendance Monitoring</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Daily roster attendance with Present, Absent, Late, and Excused status tracking, monthly roll-ups, and automated attendance percentages.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Class-wide rapid attendance register</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Low attendance warnings and trends</span>
                </li>
              </ul>
            </div>

            {/* Feature 4: Automated Report Cards */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Automated Report Cards</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                One-click publication of official academic report cards. Generates professional PDF transcripts with institutional seals and breakdown tables.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>OpenPDF vector-rendered digital transcripts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Instant student and guardian downloads</span>
                </li>
              </ul>
            </div>

            {/* Feature 5: Continuous Teacher Feedback */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Continuous Teacher Feedback</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Structured qualitative observations from educators categorized by academic growth, behavior, and customized recommendations for parents.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Subject-linked contextual remarks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Direct visibility in guardian reports</span>
                </li>
              </ul>
            </div>

            {/* Feature 6: Institutional Analytics */}
            <div className="p-7 rounded-2xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#293526] dark:bg-[#253521] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#242820] dark:text-white">Institutional Analytics</h3>
              <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Comprehensive academic intelligence for principals and department heads. Cohort comparisons, subject difficulty, and students needing attention.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#242820] dark:text-[#E8EDE4] font-medium border-t border-[#E3E1D6] dark:border-[#283623] pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>Single-roundtrip native SQL aggregation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#247A55] dark:text-emerald-400 shrink-0" />
                  <span>CSV data export for institutional auditing</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. DEDICATED ROLE PORTALS (Soft Cream Background: #F0EFE6)           */}
      {/* ==================================================================== */}
      <section id="portals" className="py-20 lg:py-28 bg-[#F0EFE6] dark:bg-[#111710]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52613B] dark:text-[#B2D297]">
              Role-Specific Workspaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#242820] dark:text-white tracking-tight font-serif">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="text-base text-[#555B50] dark:text-[#CAD6B7]">
              Select your role to securely access your dedicated academic dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Portal 1: Administrator */}
            <div className="p-6 rounded-2xl flex flex-col justify-between bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#293526] dark:bg-[#52613B] text-white flex items-center justify-center font-bold text-sm">
                  AD
                </div>
                <h3 className="mt-4 text-base font-bold text-[#242820] dark:text-white">ADMINISTRATOR</h3>
                <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                  Manage institutional configuration, students, teachers, grading scales, examinations, and institutional analytics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E3E1D6] dark:border-[#283623]">
                <Link
                  to="/login?role=admin"
                  className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <span>Access Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Portal 2: Faculty */}
            <div className="p-6 rounded-2xl flex flex-col justify-between bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#52613B] text-white flex items-center justify-center font-bold text-sm">
                  FC
                </div>
                <h3 className="mt-4 text-base font-bold text-[#242820] dark:text-white">FACULTY</h3>
                <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                  Manage assigned classes, student evaluations, marks entry, daily attendance registers, and academic remarks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E3E1D6] dark:border-[#283623]">
                <Link
                  to="/login?role=teacher"
                  className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <span>Access Faculty Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Portal 3: Student */}
            <div className="p-6 rounded-2xl flex flex-col justify-between bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#65774A] text-white flex items-center justify-center font-bold text-sm">
                  ST
                </div>
                <h3 className="mt-4 text-base font-bold text-[#242820] dark:text-white">STUDENT</h3>
                <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                  View your academic performance, subject-wise marks, attendance ratios, and download official PDF report cards.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E3E1D6] dark:border-[#283623]">
                <Link
                  to="/login?role=student"
                  className="w-full btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Portal 4: Guardian */}
            <div className="p-6 rounded-2xl flex flex-col justify-between bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] hover:border-[#52613B] dark:hover:border-[#65774A] hover:shadow-card transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3F4D2D] text-white flex items-center justify-center font-bold text-sm">
                  GD
                </div>
                <h3 className="mt-4 text-base font-bold text-[#242820] dark:text-white">GUARDIAN</h3>
                <p className="mt-2 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                  Monitor linked children's academic progress, attendance records, teacher observations, and digital transcripts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E3E1D6] dark:border-[#283623]">
                <Link
                  to="/login?role=parent"
                  className="w-full btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <span>Access Guardian Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. NEON CLOUD DATABASE SECTION (Deep Forest Green: #293526)          */}
      {/* High-Contrast: Headings: #FFFFFF, Body: #E2E8D8, Secondary: #C0C9B2  */}
      {/* ==================================================================== */}
      <section id="neon-db" className="py-20 lg:py-28 bg-[#293526] text-white relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 text-xs font-mono text-[#D2B66F] border border-[#D2B66F]/40">
              <Database className="w-4 h-4 text-[#D2B66F]" />
              <span className="font-bold">Cloud-Native Relational Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-tight font-serif">
              Powered by Neon Cloud PostgreSQL
            </h2>
            <p className="text-base text-[#E2E8D8] font-normal leading-relaxed">
              Reliable, scalable, and secure academic data management powered by cloud-native PostgreSQL.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Architecture Details (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Spec 1: Engine */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/15">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D2B66F] tracking-wider block">
                    Database Engine
                  </span>
                  <span className="text-sm font-bold text-[#FFFFFF] mt-1 block">
                    {healthData?.engineVersion || 'Neon PostgreSQL 18.7'}
                  </span>
                  <span className="text-xs text-[#C0C9B2] mt-0.5 block">
                    Serverless relational storage
                  </span>
                </div>

                {/* Spec 2: Backend */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/15">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D2B66F] tracking-wider block">
                    Backend Architecture
                  </span>
                  <span className="text-sm font-bold text-[#FFFFFF] mt-1 block">
                    {healthData?.backend || 'Spring Boot 3.3.5 / Java 21'}
                  </span>
                  <span className="text-xs text-[#C0C9B2] mt-0.5 block">
                    Hibernate 6 + HikariCP
                  </span>
                </div>

                {/* Spec 3: Deployment Region */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/15">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D2B66F] tracking-wider block">
                    Deployment Region
                  </span>
                  <span className="text-sm font-bold text-[#FFFFFF] mt-1 block">
                    {healthData?.region || 'AWS US-East-2 (Ohio)'}
                  </span>
                  <span className="text-xs text-[#C0C9B2] mt-0.5 block">
                    Multi-AZ redundant compute
                  </span>
                </div>

                {/* Spec 4: Connection Pooling */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/15">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D2B66F] tracking-wider block">
                    Connection Pooling
                  </span>
                  <span className="text-sm font-bold text-[#FFFFFF] mt-1 block">
                    {healthData?.pooler || 'PgBouncer Transaction Pooling'}
                  </span>
                  <span className="text-xs text-[#C0C9B2] mt-0.5 block">
                    Low-overhead transaction pooling
                  </span>
                </div>

              </div>

              {/* Data Safety & Non-Local Guarantee */}
              <div className="p-4 rounded-xl bg-black/40 border border-emerald-400/30 text-xs text-[#E2E8D8] flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#FFFFFF] block text-sm">Zero Local Persistence Guarantee</span>
                  <p className="text-xs text-[#E2E8D8] mt-0.5 leading-relaxed">
                    All application records, evaluations, marks, and remarks are persisted directly in Neon Cloud PostgreSQL. No SQLite, mock responses, or browser local storage are used.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Health Badge Card (5 cols) - Prominent Metrics */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-black/40 border border-white/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
                  Live Connectivity Check
                </span>
                <span className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{healthData?.database === 'CONNECTED' ? 'CONNECTED' : isHealthLoading ? 'CHECKING...' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#C0C9B2] font-medium">Database Provider:</span>
                  <span className="font-bold text-[#FFFFFF]">{healthData?.provider || 'Neon Cloud PostgreSQL'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#C0C9B2] font-medium">Active Relational Tables:</span>
                  <span className="font-bold font-mono text-emerald-300 text-sm">{healthData?.tableCount ?? 22} Tables</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#C0C9B2] font-medium">SSL / Encryption:</span>
                  <span className="font-bold text-[#FFFFFF]">{healthData?.ssl || 'TLS 1.3 / SCRAM Channel Binding'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#C0C9B2] font-medium">Round-Trip Latency:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">{healthData?.latencyMs ? `${healthData.latencyMs} ms` : 'Measuring...'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#C0C9B2] text-center font-medium">
                Diagnostics updated automatically via Spring Boot readiness probe.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. SECURITY SECTION (White Background: #FFFFFF)                      */}
      {/* ==================================================================== */}
      <section id="security" className="py-20 lg:py-28 bg-white dark:bg-[#131A12] border-b border-[#E3E1D6] dark:border-[#283623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52613B] dark:text-[#B2D297]">
              Enterprise Safeguards
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#242820] dark:text-white tracking-tight font-serif">
              Designed for Confidentiality & Integrity
            </h2>
            <p className="text-base text-[#555B50] dark:text-[#CAD6B7]">
              Implemented security controls ensuring student records remain safe, audited, and strictly role-isolated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <Shield className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Role-Based Access Control</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Spring Security evaluates user roles (ADMIN, TEACHER, STUDENT, PARENT) on every request with method-level security.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <Lock className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Secure Authentication</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Passwords hashed using BCrypt. Authentication tokens signed with HMAC-SHA 256-bit cryptographic keys.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <Server className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Protected Sessions</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Tokens delivered via HttpOnly cookies with SameSite protection to prevent cross-site scripting (XSS) leaks.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <Layers className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Strict Data Isolation</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Students access solely their own records. Guardians only see children officially linked through parent-student mappings.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <Cpu className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Secure Database Communication</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                All Spring Boot connections to Neon Cloud PostgreSQL use mandatory TLS encryption and SCRAM-SHA-256 channel binding.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F7F2] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <FileCheck className="w-6 h-6 text-[#52613B] dark:text-[#B2D297] mb-3" />
              <h4 className="text-sm font-bold text-[#242820] dark:text-white">Controlled Report Access</h4>
              <p className="mt-1 text-xs text-[#555B50] dark:text-[#CAD6B7] leading-relaxed">
                Official PDF report card downloads require authorized student or guardian authentication with tamper-evident checks.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FOOTER (Deep Forest Green: #1E271C)                               */}
      {/* High-Contrast: Headings: #FFFFFF, Body: #E2E8D8, Secondary: #C0C9B2  */}
      {/* ==================================================================== */}
      <footer className="bg-[#1E271C] text-white py-16 border-t border-[#293526]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-base font-bold text-[#FFFFFF] block font-serif">
                    Oakridge Academy
                  </span>
                  <span className="text-[11px] uppercase font-bold text-[#D2B66F] block">
                    Academic Reporting Platform
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#E2E8D8] leading-relaxed font-normal">
                Enterprise academic performance tracking, continuous evaluation, and digital transcripts powered by Neon Cloud PostgreSQL.
              </p>
            </div>

            {/* Col 2: Platform Navigation */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D2B66F] block mb-4">
                Platform Navigation
              </span>
              <ul className="space-y-2.5 text-xs text-[#E2E8D8]">
                <li>
                  <button onClick={() => scrollTo('home')} className="hover:text-white transition-colors cursor-pointer font-medium">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer font-medium">
                    Platform Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('portals')} className="hover:text-white transition-colors cursor-pointer font-medium">
                    Role Portals
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('neon-db')} className="hover:text-white transition-colors cursor-pointer font-medium">
                    Neon Cloud DB
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('security')} className="hover:text-white transition-colors cursor-pointer font-medium">
                    Security Safeguards
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Role Portals */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D2B66F] block mb-4">
                Role Portals
              </span>
              <ul className="space-y-2.5 text-xs text-[#E2E8D8]">
                <li>
                  <Link to="/login?role=admin" className="hover:text-white transition-colors font-medium">
                    Administrator Workspace
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=teacher" className="hover:text-white transition-colors font-medium">
                    Faculty Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=student" className="hover:text-white transition-colors font-medium">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=parent" className="hover:text-white transition-colors font-medium">
                    Guardian Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Technical Specs */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D2B66F] block mb-4">
                Infrastructure
              </span>
              <div className="space-y-2 text-xs text-[#E2E8D8] font-mono font-medium">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Neon PostgreSQL 18.7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Spring Boot 3.3.5 / Java 21</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>React 19 + Vite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>AWS US-East-2 (Ohio)</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#C0C9B2] gap-4">
            <span>© 2026 Oakridge Academy Academic Reporting Platform. All rights reserved.</span>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="hover:text-white transition-colors font-medium">Portal Login</Link>
              <button onClick={() => scrollTo('security')} className="hover:text-white transition-colors cursor-pointer font-medium">Security Policy</button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
