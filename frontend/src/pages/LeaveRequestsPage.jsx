import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Check,
  X,
  Filter,
  Search,
  Eye,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  CalendarDays,
  UserCheck,
  Building,
  Layers,
  Paperclip,
  Download,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick Leave', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' },
  { value: 'CASUAL', label: 'Casual Leave', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800' },
  { value: 'EMERGENCY', label: 'Emergency Leave', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' },
  { value: 'PERSONAL', label: 'Personal Leave', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800' },
  { value: 'MEDICAL', label: 'Medical Leave', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'ACADEMIC', label: 'Academic Leave', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' },
  { value: 'FAMILY', label: 'Family Leave', color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' }
];

const LeaveRequestsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const isAdmin = role === 'ADMIN';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState(isAdmin ? 'ALL' : 'MY_LEAVES');

  // Main data states
  const [leaves, setLeaves] = useState([]);
  const [studentLeavesForTeacher, setStudentLeavesForTeacher] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Form states
  const [applyForm, setApplyForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
    documentUrl: ''
  });
  const [submittingApply, setSubmittingApply] = useState(false);

  // Review (Admin) state
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewingAction, setReviewingAction] = useState(null); // 'APPROVED' or 'REJECTED'
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recommendation (Teacher) state
  const [recommendationText, setRecommendationText] = useState('');
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  useEffect(() => {
    loadData();
  }, [isAdmin, isTeacher, isStudent]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [leavesRes, statsRes] = await Promise.all([
          api.get('/leaves'),
          api.get('/leaves/stats')
        ]);
        if (leavesRes.data?.success) setLeaves(leavesRes.data.data || []);
        if (statsRes.data?.success) setStats(statsRes.data.data || null);
      } else if (isTeacher) {
        const [myLeavesRes, studentLeavesRes, statsRes] = await Promise.all([
          api.get('/leaves/my-leaves'),
          api.get('/leaves/student-leaves-for-teacher'),
          api.get('/leaves/stats')
        ]);
        if (myLeavesRes.data?.success) setLeaves(myLeavesRes.data.data || []);
        if (studentLeavesRes.data?.success) setStudentLeavesForTeacher(studentLeavesRes.data.data || []);
        if (statsRes.data?.success) setStats(statsRes.data.data || null);
      } else {
        // STUDENT: Strictly isolated to own leave applications
        const myLeavesRes = await api.get('/leaves/my-leaves');
        if (myLeavesRes.data?.success) setLeaves(myLeavesRes.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  // Handle Application Submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate) {
      toast.error('Please specify both Start Date and End Date.');
      return;
    }
    if (new Date(applyForm.endDate) < new Date(applyForm.startDate)) {
      toast.error('End Date cannot precede Start Date.');
      return;
    }
    if (!applyForm.reason.trim()) {
      toast.error('Please provide a reason for the leave application.');
      return;
    }

    setSubmittingApply(true);
    try {
      const res = await api.post('/leaves/apply', applyForm);
      if (res.data?.success) {
        toast.success('Leave application submitted successfully!');
        setShowApplyModal(false);
        setApplyForm({
          leaveType: 'CASUAL',
          startDate: '',
          endDate: '',
          reason: '',
          documentUrl: ''
        });
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file leave application');
    } finally {
      setSubmittingApply(false);
    }
  };

  // Handle Cancel Leave
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave application?')) {
      return;
    }
    try {
      const res = await api.patch(`/leaves/${leaveId}/cancel`);
      if (res.data?.success) {
        toast.success('Leave application cancelled');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel application');
    }
  };

  // Handle Review (Admin Approve/Reject)
  const handleReviewSubmit = async (action) => {
    if (action === 'REJECTED' && !reviewRemarks.trim()) {
      toast.error('A rejection reason is mandatory before rejecting a leave application.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.patch(`/leaves/${selectedLeave.id}/status`, {
        status: action,
        remarks: reviewRemarks.trim()
      });
      if (res.data?.success) {
        toast.success(`Leave request ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
        setShowReviewModal(false);
        setSelectedLeave(null);
        setReviewRemarks('');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process decision');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Faculty Recommendation
  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    if (!recommendationText.trim()) {
      toast.error('Please enter your faculty recommendation or remarks.');
      return;
    }
    setSubmittingRecommendation(true);
    try {
      const res = await api.patch(`/leaves/${selectedLeave.id}/recommend`, {
        recommendation: recommendationText.trim()
      });
      if (res.data?.success) {
        toast.success('Faculty recommendation recorded and dispatched to Administration!');
        setShowRecommendModal(false);
        setSelectedLeave(null);
        setRecommendationText('');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save recommendation');
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  // Determine current dataset based on Active Tab
  const currentDataset = useMemo(() => {
    if (isAdmin) {
      switch (activeTab) {
        case 'TEACHER':
          return leaves.filter((l) => l.role === 'TEACHER');
        case 'STUDENT':
          return leaves.filter((l) => l.role === 'STUDENT');
        case 'PENDING':
          return leaves.filter((l) => l.status === 'PENDING');
        case 'APPROVED':
          return leaves.filter((l) => l.status === 'APPROVED');
        case 'REJECTED':
          return leaves.filter((l) => l.status === 'REJECTED');
        default:
          return leaves;
      }
    } else if (isTeacher) {
      if (activeTab === 'STUDENT_LEAVES') {
        return studentLeavesForTeacher;
      }
      return leaves;
    }
    return leaves;
  }, [leaves, studentLeavesForTeacher, activeTab, isAdmin, isTeacher]);

  // Filtered dataset for display
  const filteredLeaves = useMemo(() => {
    return currentDataset.filter((l) => {
      // Type Filter
      if (typeFilter !== 'ALL' && l.leaveType !== typeFilter) return false;
      // Status Filter
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      // Date Filter
      if (dateFilter && (l.startDate > dateFilter || l.endDate < dateFilter)) return false;
      // Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = l.userFullName?.toLowerCase().includes(q);
        const matchEmail = l.userEmail?.toLowerCase().includes(q);
        const matchReason = l.reason?.toLowerCase().includes(q);
        const matchRoll = l.studentRollNumber?.toLowerCase().includes(q);
        const matchClass = l.className?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchReason && !matchRoll && !matchClass) return false;
      }
      return true;
    });
  }, [currentDataset, typeFilter, statusFilter, dateFilter, searchTerm]);

  // Helpers for Calendar rendering
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty lead slots
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null });
    }

    // Days with leave mappings
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dayLeaves = (isAdmin ? leaves : isTeacher ? [...leaves, ...studentLeavesForTeacher] : leaves).filter((l) => {
        return dateStr >= l.startDate && dateStr <= l.endDate;
      });

      const approvedTeachers = dayLeaves.filter((l) => l.status === 'APPROVED' && l.role === 'TEACHER');
      const approvedStudents = dayLeaves.filter((l) => l.status === 'APPROVED' && l.role === 'STUDENT');
      const pendingLeaves = dayLeaves.filter((l) => l.status === 'PENDING');

      days.push({
        day: d,
        dateStr,
        leaves: dayLeaves,
        approvedTeachersCount: approvedTeachers.length,
        approvedStudentsCount: approvedStudents.length,
        pendingCount: pendingLeaves.length
      });
    }

    return days;
  }, [calendarDate, leaves, studentLeavesForTeacher, isAdmin, isTeacher]);

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ==================================================================== */}
      {/* 1. TOP HEADER BANNER & ACTIONS                                       */}
      {/* ==================================================================== */}
      <div className="card-premium p-6 bg-white dark:bg-[#182216] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6] dark:border-[#283623] rounded-2xl shadow-card transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] dark:text-[#B2D297] bg-[#E4EAD9] dark:bg-[#202E1B] px-3 py-1 rounded-full border border-[#CAD6B7] dark:border-[#2D4026]">
              {isAdmin ? 'Institutional Governance' : isTeacher ? 'Faculty & Scholar Leave Desk' : 'Student Academic Welfare'}
            </span>
            <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-semibold">
              {isAdmin ? 'Master Leave Approval Registry' : isTeacher ? 'Leave History & Assigned Classes' : 'Personal Leave Ledger'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#242820] dark:text-white mt-1.5 tracking-tight font-serif">
            {isAdmin ? 'Leave Management & Multi-Role Approval Center' : isTeacher ? 'Faculty Leave Management & Class Monitor' : 'Student Leave Application Portal'}
          </h2>
          <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-medium mt-1 max-w-2xl">
            {isAdmin
              ? 'Complete institutional workflow for reviewing, approving, recommending, and monitoring teacher and scholar leaves of absence.'
              : isTeacher
              ? 'Apply for personal leaves, track administrative approvals, and review and recommend leave applications for scholars in your assigned classes.'
              : 'Submit authorized leaves of absence with supporting justifications, and track your review status and administrator remarks in real time.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {(isTeacher || isStudent) && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTeacher ? 'Apply for Teacher Leave' : 'Submit Leave Application'}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4 shadow-card cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>File Administrative Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STATISTICAL KPI CARDS (ADMIN & TEACHER)                           */}
      {/* ==================================================================== */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#74796D] dark:text-[#8D9686] block">
              Total Requests
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-[#242820] dark:text-white font-serif">{stats.total}</span>
              <span className="text-[10px] text-[#555B50] dark:text-[#CAD6B7]">Records</span>
            </div>
          </div>

          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-amber-200/80 dark:border-amber-800/60 rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              Pending Approvals
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-amber-800 dark:text-amber-300 font-serif">{stats.pending}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">Action req.</span>
            </div>
          </div>

          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#247A55] dark:text-emerald-400 block">
              Approved
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-[#247A55] dark:text-emerald-300 font-serif">{stats.approved}</span>
              <span className="text-[10px] text-[#247A55] dark:text-emerald-400">Granted</span>
            </div>
          </div>

          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-rose-200/80 dark:border-rose-800/60 rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B84040] dark:text-rose-400 block">
              Rejected
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-[#B84040] dark:text-rose-300 font-serif">{stats.rejected}</span>
              <span className="text-[10px] text-[#B84040] dark:text-rose-400">Declined</span>
            </div>
          </div>

          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52613B] dark:text-[#B2D297] block">
              Faculty Leaves
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-[#52613B] dark:text-[#B2D297] font-serif">{stats.teacherTotal}</span>
              <span className="text-[10px] text-[#555B50] dark:text-[#CAD6B7]">({stats.teacherPending} pend.)</span>
            </div>
          </div>

          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-xl shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#386A91] dark:text-sky-400 block">
              Scholar Leaves
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-[#386A91] dark:text-sky-300 font-serif">{stats.studentTotal}</span>
              <span className="text-[10px] text-[#555B50] dark:text-[#CAD6B7]">({stats.studentPending} pend.)</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. NAVIGATION TABS                                                   */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F0EFE6] dark:bg-[#131A12] p-1.5 rounded-2xl border border-[#E3E1D6] dark:border-[#283623]">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
              <span>All Leave Requests</span>
              <span className="text-[10px] bg-[#E4EAD9] dark:bg-[#202E1B] text-[#52613B] dark:text-[#B2D297] px-1.5 py-0.2 rounded-full ml-1">
                {leaves.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('TEACHER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'TEACHER'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
              <span>Teacher Leave Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'STUDENT'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#386A91] dark:text-sky-400" />
              <span>Student Leave Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-white dark:bg-[#182216] text-amber-800 dark:text-amber-300 shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pending Approvals</span>
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'APPROVED'
                  ? 'bg-white dark:bg-[#182216] text-[#247A55] dark:text-emerald-300 shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#247A55] dark:text-emerald-400" />
              <span>Approved Leaves</span>
            </button>

            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'REJECTED'
                  ? 'bg-white dark:bg-[#182216] text-[#B84040] dark:text-rose-300 shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-[#B84040] dark:text-rose-400" />
              <span>Rejected Leaves</span>
            </button>
          </>
        )}

        {isTeacher && (
          <>
            <button
              onClick={() => setActiveTab('MY_LEAVES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'MY_LEAVES'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
              <span>My Leave Requests</span>
              <span className="text-[10px] bg-[#E4EAD9] dark:bg-[#202E1B] text-[#52613B] dark:text-[#B2D297] px-1.5 py-0.2 rounded-full ml-1">
                {leaves.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STUDENT_LEAVES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'STUDENT_LEAVES'
                  ? 'bg-white dark:bg-[#182216] text-[#386A91] dark:text-sky-300 shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#386A91] dark:text-sky-400" />
              <span>Class Scholars Leave Registry</span>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-[#386A91] dark:text-sky-300 px-1.5 py-0.2 rounded-full ml-1">
                {studentLeavesForTeacher.length}
              </span>
            </button>
          </>
        )}

        {isStudent && (
          <button
            onClick={() => setActiveTab('MY_LEAVES')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs flex items-center space-x-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
            <span>My Leave Applications</span>
            <span className="text-[10px] bg-[#E4EAD9] dark:bg-[#202E1B] text-[#52613B] dark:text-[#B2D297] px-1.5 py-0.2 rounded-full ml-1">
              {leaves.length}
            </span>
          </button>
        )}

        {/* Calendar and Reports Tabs */}
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ml-auto ${
            activeTab === 'CALENDAR'
              ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
              : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
          <span>Leave Calendar</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'REPORTS'
                ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820] dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
            <span>Leave Reports</span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. MAIN CONTENT AREA BASED ON TAB                                    */}
      {/* ==================================================================== */}

      {/* VIEW A: CALENDAR VIEW */}
      {activeTab === 'CALENDAR' ? (
        <div className="card-premium p-6 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E1D6] dark:border-[#283623]">
            <div>
              <h3 className="text-lg font-bold text-[#242820] dark:text-white font-serif">
                Academic Leave & Absence Calendar
              </h3>
              <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-0.5">
                Institutional calendar tracking approved faculty and scholar absences by date.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={prevMonth}
                className="btn-secondary text-xs p-2 rounded-lg cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-[#242820] dark:text-white min-w-[140px] text-center font-serif">
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={nextMonth}
                className="btn-secondary text-xs p-2 rounded-lg cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="p-2 font-bold text-[11px] uppercase tracking-wider text-[#74796D] dark:text-[#8D9686] bg-[#F8F7F2] dark:bg-[#131A12] rounded-lg">
                {d}
              </div>
            ))}

            {calendarDays.map((item, idx) => {
              if (!item.day) {
                return <div key={idx} className="min-h-[90px] p-2 bg-[#F8F7F2]/40 dark:bg-[#121811]/40 rounded-xl" />;
              }

              const isSelected = selectedCalendarDay?.dateStr === item.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCalendarDay(item)}
                  className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#52613B] ring-2 ring-[#52613B]/20 bg-[#F0EFE6] dark:bg-[#202E1B]'
                      : 'border-[#E3E1D6] dark:border-[#283623] hover:border-[#CAD6B7] dark:hover:border-[#3A4E33] bg-white dark:bg-[#182216]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#242820] dark:text-white">{item.day}</span>
                    {item.leaves.length > 0 && (
                      <span className="text-[10px] font-bold text-[#52613B] dark:text-[#B2D297]">
                        {item.leaves.length} on leave
                      </span>
                    )}
                  </div>

                  {/* Badges on cell */}
                  <div className="space-y-1 mt-1.5">
                    {item.approvedTeachersCount > 0 && (
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-[#247A55] dark:text-emerald-300 truncate">
                        {item.approvedTeachersCount} Faculty Absent
                      </div>
                    )}
                    {item.approvedStudentsCount > 0 && (
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/70 text-[#386A91] dark:text-sky-300 truncate">
                        {item.approvedStudentsCount} Scholar Leaves
                      </div>
                    )}
                    {item.pendingCount > 0 && (
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 truncate">
                        {item.pendingCount} Pending
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Inspector */}
          {selectedCalendarDay && selectedCalendarDay.leaves.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] animate-fadeIn space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#242820] dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
                  <span>Leaves Scheduled on {selectedCalendarDay.dateStr}</span>
                </h4>
                <button
                  onClick={() => setSelectedCalendarDay(null)}
                  className="text-xs text-[#74796D] hover:text-[#242820] dark:hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {selectedCalendarDay.leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-lg bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] text-xs space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-[#242820] dark:text-white font-bold">{l.userFullName}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-[#247A55] dark:text-emerald-300'
                          : l.status === 'REJECTED'
                          ? 'bg-red-100 dark:bg-rose-950 text-[#B84040] dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555B50] dark:text-[#CAD6B7]">
                      {l.role} • {l.leaveType} ({l.startDate} to {l.endDate})
                    </p>
                    <p className="text-[11px] text-[#74796D] dark:text-[#8D9686] italic truncate">
                      "{l.reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'REPORTS' && isAdmin ? (
        /* VIEW B: ANALYTICS & REPORTS */
        <div className="space-y-6">
          <div className="card-premium p-6 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl shadow-card space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#242820] dark:text-white font-serif">
                Institutional Leave Governance Reports & Trends
              </h3>
              <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-0.5">
                Summary metrics of leave frequency, approval throughput, and department breakdowns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Approval Rate Card */}
              <div className="p-5 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-3">
                <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                  Institutional Approval Velocity
                </span>
                <div className="text-3xl font-extrabold text-[#52613B] dark:text-[#B2D297] font-serif">
                  {stats?.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-[#74796D] dark:text-[#8D9686]">
                  {stats?.approved || 0} of {stats?.total || 0} total institutional leave applications have been authorized by Administration.
                </p>
              </div>

              {/* Teacher vs Student Breakdown */}
              <div className="p-5 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-3">
                <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                  Role Distribution
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#242820] dark:text-white">Teachers</span>
                      <span className="text-[#52613B] dark:text-[#B2D297]">{stats?.teacherTotal || 0} ({stats?.total > 0 ? Math.round((stats.teacherTotal / stats.total) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E3E1D6] dark:bg-[#283623] overflow-hidden">
                      <div
                        className="h-full bg-[#52613B] rounded-full"
                        style={{ width: `${stats?.total > 0 ? (stats.teacherTotal / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#242820] dark:text-white">Students</span>
                      <span className="text-[#386A91] dark:text-sky-300">{stats?.studentTotal || 0} ({stats?.total > 0 ? Math.round((stats.studentTotal / stats.total) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E3E1D6] dark:bg-[#283623] overflow-hidden">
                      <div
                        className="h-full bg-[#386A91] rounded-full"
                        style={{ width: `${stats?.total > 0 ? (stats.studentTotal / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="p-5 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-3">
                <span className="text-xs font-bold text-[#555B50] dark:text-[#CAD6B7] uppercase tracking-wider block">
                  Status Pipeline
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-lg font-bold text-[#247A55] dark:text-emerald-300 block font-serif">{stats?.approved || 0}</span>
                    <span className="text-[10px] text-[#247A55] dark:text-emerald-400 font-semibold">Approved</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-lg font-bold text-amber-800 dark:text-amber-300 block font-serif">{stats?.pending || 0}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Pending</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                    <span className="text-lg font-bold text-[#B84040] dark:text-rose-300 block font-serif">{stats?.rejected || 0}</span>
                    <span className="text-[10px] text-[#B84040] dark:text-rose-400 font-semibold">Rejected</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300 block font-serif">{stats?.cancelled || 0}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW C: LEAVE APPLICATION RECORDS TABLE & FILTERS */
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="card-premium p-4 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl flex flex-wrap items-center gap-3 text-xs shadow-xs transition-colors">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#74796D] dark:text-[#8D9686] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by applicant, roll number, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl text-xs text-[#242820] dark:text-white placeholder-[#74796D] focus:border-[#52613B] outline-none"
              />
            </div>

            {/* Leave Type Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#74796D] dark:text-[#8D9686] font-semibold text-[11px]">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#242820] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Leave Types</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#74796D] dark:text-[#8D9686] font-semibold text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#242820] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#74796D] dark:text-[#8D9686] font-semibold text-[11px]">Active on:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-2 py-1.5 text-xs text-[#242820] dark:text-white outline-none"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="p-1.5 text-[#74796D] hover:text-[#B84040]"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setDateFilter('');
                }}
                className="text-xs font-semibold text-[#52613B] dark:text-[#B2D297] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Table Card */}
          <div className="card-premium overflow-hidden bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl shadow-card transition-colors">
            
            <div className="p-4 border-b border-[#E3E1D6] dark:border-[#283623] bg-[#F8F7F2] dark:bg-[#131A12] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#242820] dark:text-white">
                  {isAdmin
                    ? 'Institutional Application Register'
                    : isTeacher && activeTab === 'STUDENT_LEAVES'
                    ? 'Assigned Scholars Leave Records'
                    : 'Personal Leave Ledger'}
                </h3>
                <span className="text-[11px] font-mono text-[#52613B] dark:text-[#B2D297] bg-[#E4EAD9] dark:bg-[#202E1B] px-2.5 py-0.5 rounded-full font-bold">
                  {filteredLeaves.length} matching
                </span>
              </div>

              <span className="text-xs text-[#74796D] dark:text-[#8D9686]">
                Data isolation: <strong className="text-[#242820] dark:text-white font-semibold">{role} Verified</strong>
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#74796D] dark:text-[#CAD6B7]">
                Retrieving institutional leave applications from Neon PostgreSQL...
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] flex items-center justify-center mx-auto text-[#52613B] dark:text-[#B2D297]">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#242820] dark:text-white">No Leave Applications Found</h4>
                <p className="text-xs text-[#74796D] dark:text-[#CAD6B7] max-w-sm mx-auto">
                  {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'No leave records match the specified search or filter criteria.'
                    : isStudent
                    ? 'You have not submitted any leave requests yet. Click "Submit Leave Application" to apply.'
                    : 'There are no active leave applications registered under this section.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E3E1D6] dark:divide-[#283623] text-left text-xs">
                  <thead className="bg-[#F0EFE6] dark:bg-[#131A12] text-[#242820] dark:text-[#CAD6B7] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">Applicant & Identity</th>
                      <th className="px-4 py-3.5">Leave Type</th>
                      <th className="px-4 py-3.5">Duration Window</th>
                      <th className="px-4 py-3.5">Reason & Faculty Recommendation</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E1D6] dark:divide-[#283623] bg-white dark:bg-[#182216]">
                    {filteredLeaves.map((l) => {
                      const typeObj = LEAVE_TYPES.find((t) => t.value === l.leaveType) || LEAVE_TYPES[0];
                      const canCancel = (l.userEmail === user?.email || l.userId === user?.id) && l.status === 'PENDING';
                      const canRecommend = isTeacher && l.role === 'STUDENT';
                      const canReview = isAdmin;

                      return (
                        <tr key={l.id} className="hover:bg-[#F8F7F2] dark:hover:bg-[#1E281C] transition-colors">
                          {/* Applicant */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-start space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#E4EAD9] dark:bg-[#202E1B] text-[#52613B] dark:text-[#B2D297] font-bold flex items-center justify-center shrink-0 border border-[#CAD6B7] dark:border-[#2D4026] text-xs">
                                {l.userFullName ? l.userFullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <strong className="text-[#242820] dark:text-white font-bold block">
                                  {l.userFullName}
                                </strong>
                                <span className="text-[11px] text-[#74796D] dark:text-[#CAD6B7] block">
                                  {l.userEmail}
                                </span>
                                {l.role === 'STUDENT' ? (
                                  <span className="text-[10px] font-semibold text-[#386A91] dark:text-sky-300 block mt-0.5">
                                    {l.className ? `${l.className} (Sec ${l.sectionName || 'A'})` : 'Student Scholar'} • Roll: {l.studentRollNumber || '—'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-[#52613B] dark:text-[#B2D297] block mt-0.5">
                                    Faculty • {l.department || 'Academic Department'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Leave Type */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeObj.color}`}>
                              {typeObj.label}
                            </span>
                            {l.documentUrl && (
                              <div className="flex items-center space-x-1 text-[10px] text-[#52613B] dark:text-[#B2D297] mt-1 font-semibold">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{l.documentUrl}</span>
                              </div>
                            )}
                          </td>

                          {/* Duration Window */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="text-[#242820] dark:text-white font-bold flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
                              <span>{l.startDate} → {l.endDate}</span>
                            </div>
                            <span className="text-[11px] text-[#74796D] dark:text-[#8D9686] block mt-0.5">
                              Applied on: {new Date(l.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Reason & Recommendation */}
                          <td className="px-4 py-3.5 max-w-xs">
                            <p className="text-[#555B50] dark:text-[#CAD6B7] line-clamp-2 text-xs">
                              {l.reason}
                            </p>

                            {/* Faculty Recommendation Banner */}
                            {l.facultyRecommendation && (
                              <div className="mt-1.5 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-[11px] text-[#386A91] dark:text-sky-300">
                                <span className="font-bold flex items-center space-x-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Faculty Recommendation:</span>
                                </span>
                                <p className="italic mt-0.5">"{l.facultyRecommendation}"</p>
                                {l.recommendedByName && (
                                  <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] block text-right">
                                    — {l.recommendedByName}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Reviewer remarks if decided */}
                            {l.reviewerRemarks && (
                              <div className="mt-1 text-[11px] text-[#555B50] dark:text-[#CAD6B7]">
                                <strong className="text-[#242820] dark:text-white">Admin Note:</strong> {l.reviewerRemarks}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {l.status === 'APPROVED' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-[#247A55] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : l.status === 'REJECTED' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-[#B84040] dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            ) : l.status === 'CANCELLED' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                <AlertCircle className="w-3 h-3" />
                                <span>Cancelled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            {/* Inspect Details Button */}
                            <button
                              onClick={() => {
                                setSelectedLeave(l);
                                setShowDetailModal(true);
                              }}
                              className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center space-x-1 cursor-pointer"
                              title="View Application Details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>

                            {/* Faculty Recommendation Action */}
                            {canRecommend && (
                              <button
                                onClick={() => {
                                  setSelectedLeave(l);
                                  setRecommendationText(l.facultyRecommendation || '');
                                  setShowRecommendModal(true);
                                }}
                                className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center space-x-1 text-[#386A91] dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer"
                                title="Add Faculty Recommendation"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Recommend</span>
                              </button>
                            )}

                            {/* Admin Review Action */}
                            {canReview && l.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedLeave(l);
                                  setReviewRemarks('');
                                  setShowReviewModal(true);
                                }}
                                className="btn-primary text-[11px] py-1 px-3 inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                                title="Review Application"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Review</span>
                              </button>
                            )}

                            {/* Cancel Action for applicant on pending */}
                            {canCancel && (
                              <button
                                onClick={() => handleCancelLeave(l.id)}
                                className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center space-x-1 text-[#B84040] dark:text-rose-400 border-red-200 dark:border-rose-900 hover:bg-red-50 dark:hover:bg-rose-950 cursor-pointer"
                                title="Cancel Pending Leave"
                              >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. MODAL: APPLY FOR LEAVE                                            */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={isTeacher ? "Submit Teacher Leave Application" : isStudent ? "Apply for Student Leave of Absence" : "File Institutional Leave Request"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#E4EAD9]/60 dark:bg-[#202E1B] border border-[#CAD6B7] dark:border-[#2D4026] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#555B50] dark:text-[#CAD6B7] block">
                Applicant Role Verification
              </span>
              <strong className="text-sm font-bold text-[#242820] dark:text-white font-serif">
                {user?.fullName} ({role})
              </strong>
            </div>
            <span className="text-[10px] font-bold text-[#52613B] dark:text-[#B2D297] bg-white dark:bg-[#182216] px-2.5 py-1 rounded-lg border border-[#CAD6B7] dark:border-[#2D4026]">
              Academic Year 2026-2027
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
              Leave Classification <span className="text-[#B84040]">*</span>
            </label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              required
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
                Start Date <span className="text-[#B84040]">*</span>
              </label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
                End Date <span className="text-[#B84040]">*</span>
              </label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
              Reason & Academic Justification <span className="text-[#B84040]">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide a detailed explanation of the leave requirement..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl p-3 text-xs text-[#242820] dark:text-white outline-none focus:border-[#52613B] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
              Supporting Document Reference (Optional)
            </label>
            <div className="relative">
              <Paperclip className="w-3.5 h-3.5 text-[#74796D] dark:text-[#8D9686] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. MedCert-2026-981.pdf, hospital note ref, or doc URL"
                value={applyForm.documentUrl}
                onChange={(e) => setApplyForm({ ...applyForm, documentUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl text-xs text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              />
            </div>
            <span className="text-[10px] text-[#74796D] dark:text-[#CAD6B7] mt-1 block">
              Medical certificates or formal guardian notes can be referenced here.
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-[#E3E1D6] dark:border-[#283623]">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="btn-secondary text-xs font-semibold py-2 px-3.5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingApply}
              className="btn-primary text-xs font-semibold py-2 px-4 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submittingApply ? 'Submitting to Registry...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* 6. MODAL: ADMINISTRATOR REVIEW (APPROVE / REJECT)                    */}
      {/* ==================================================================== */}
      {selectedLeave && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedLeave(null);
          }}
          title="Administrative Leave Review & Decision"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Applicant Summary */}
            <div className="p-3.5 rounded-xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#242820] dark:text-white">
                  {selectedLeave.userFullName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4EAD9] dark:bg-[#202E1B] text-[#52613B] dark:text-[#B2D297]">
                  {selectedLeave.role}
                </span>
              </div>
              <p className="text-[11px] text-[#555B50] dark:text-[#CAD6B7]">
                {selectedLeave.userEmail} {selectedLeave.className && `• ${selectedLeave.className} Section ${selectedLeave.sectionName || 'A'}`}
              </p>
              <div className="pt-1 text-[11px] font-semibold text-[#52613B] dark:text-[#B2D297] flex items-center space-x-2">
                <span>Requested: <strong>{selectedLeave.leaveType}</strong></span>
                <span>•</span>
                <span>{selectedLeave.startDate} to {selectedLeave.endDate}</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#74796D] dark:text-[#8D9686] block mb-1">
                Applicant Stated Reason:
              </span>
              <div className="p-3 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] text-[#242820] dark:text-[#CAD6B7] leading-relaxed">
                {selectedLeave.reason}
              </div>
            </div>

            {/* Document if any */}
            {selectedLeave.documentUrl && (
              <div className="p-2.5 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-[#52613B] dark:text-[#B2D297]" />
                <span className="font-semibold text-[11px] text-[#242820] dark:text-white">Supporting Document Reference:</span>
                <span className="font-mono text-[11px] text-[#52613B] dark:text-[#B2D297]">{selectedLeave.documentUrl}</span>
              </div>
            )}

            {/* Faculty recommendation if any */}
            {selectedLeave.facultyRecommendation && (
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-[#386A91] dark:text-sky-300">
                <span className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Register Faculty Recommendation:</span>
                </span>
                <p className="mt-1 italic">"{selectedLeave.facultyRecommendation}"</p>
                {selectedLeave.recommendedByName && (
                  <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] block text-right mt-1">
                    Recorded by {selectedLeave.recommendedByName}
                  </span>
                )}
              </div>
            )}

            {/* Admin Decision Remarks */}
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
                Administrative Remarks / Reason <span className="text-[#B84040]">* (Required if Rejecting)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter approval conditions or mandatory rejection justification..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl p-3 text-xs text-[#242820] dark:text-white outline-none focus:border-[#52613B] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-[#E3E1D6] dark:border-[#283623]">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedLeave(null);
                }}
                className="btn-secondary text-xs font-semibold py-2 px-3.5 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleReviewSubmit('REJECTED')}
                className="py-2 px-4 rounded-xl bg-[#B84040] hover:bg-[#9E3333] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Application</span>
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleReviewSubmit('APPROVED')}
                className="py-2 px-4 rounded-xl bg-[#247A55] hover:bg-[#1D6345] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Leave</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 7. MODAL: FACULTY RECOMMENDATION                                     */}
      {/* ==================================================================== */}
      {selectedLeave && (
        <Modal
          isOpen={showRecommendModal}
          onClose={() => {
            setShowRecommendModal(false);
            setSelectedLeave(null);
          }}
          title="Add Register Faculty Recommendation"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRecommendSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#74796D] dark:text-[#8D9686] block">
                Scholar Leave Review
              </span>
              <strong className="text-sm font-bold text-[#242820] dark:text-white">
                {selectedLeave.userFullName}
              </strong>
              <p className="text-[11px] text-[#555B50] dark:text-[#CAD6B7]">
                {selectedLeave.className} Section {selectedLeave.sectionName || 'A'} • Roll: {selectedLeave.studentRollNumber || '—'}
              </p>
              <p className="text-[11px] font-semibold text-[#52613B] dark:text-[#B2D297]">
                {selectedLeave.leaveType} ({selectedLeave.startDate} to {selectedLeave.endDate})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5">
                Faculty Recommendation Remarks <span className="text-[#B84040]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Recommended - student has arranged assignments with peers; or Request doctor's clearance note..."
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                className="w-full bg-white dark:bg-[#131A12] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-xl p-3 text-xs text-[#242820] dark:text-white outline-none focus:border-[#52613B] resize-none"
              />
              <span className="text-[10px] text-[#74796D] dark:text-[#CAD6B7] mt-1 block">
                Your recommendation will be immediately visible to Administrators for final authorization.
              </span>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-[#E3E1D6] dark:border-[#283623]">
              <button
                type="button"
                onClick={() => {
                  setShowRecommendModal(false);
                  setSelectedLeave(null);
                }}
                className="btn-secondary text-xs font-semibold py-2 px-3.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRecommendation}
                className="btn-primary text-xs font-semibold py-2 px-4 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submittingRecommendation ? 'Saving...' : 'Save Recommendation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 8. MODAL: APPLICATION FULL DETAILS & AUDIT LOG                       */}
      {/* ==================================================================== */}
      {selectedLeave && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLeave(null);
          }}
          title="Leave Application Comprehensive Audit Record"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            
            {/* Header Identity */}
            <div className="p-4 rounded-2xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74796D] dark:text-[#8D9686] block">
                  Application Registry ID
                </span>
                <span className="font-mono text-xs font-bold text-[#52613B] dark:text-[#B2D297]">
                  {selectedLeave.id}
                </span>
                <strong className="text-sm font-bold text-[#242820] dark:text-white block mt-1">
                  {selectedLeave.userFullName}
                </strong>
                <span className="text-[11px] text-[#555B50] dark:text-[#CAD6B7]">
                  {selectedLeave.userEmail} ({selectedLeave.role})
                </span>
              </div>

              <div>
                {selectedLeave.status === 'APPROVED' ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-[#247A55] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved</span>
                  </span>
                ) : selectedLeave.status === 'REJECTED' ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-[#B84040] dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                  </span>
                ) : selectedLeave.status === 'CANCELLED' ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Cancelled</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Approval</span>
                  </span>
                )}
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
              <div>
                <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] uppercase font-bold block">Leave Type</span>
                <span className="font-bold text-[#52613B] dark:text-[#B2D297] text-xs">{selectedLeave.leaveType}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] uppercase font-bold block">Duration Window</span>
                <span className="font-bold text-[#242820] dark:text-white text-xs">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] uppercase font-bold block">Filed Timestamp</span>
                <span className="font-mono text-[#555B50] dark:text-[#CAD6B7] text-[11px]">{new Date(selectedLeave.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] uppercase font-bold block">Decision Timestamp</span>
                <span className="font-mono text-[#555B50] dark:text-[#CAD6B7] text-[11px]">
                  {selectedLeave.decisionAt ? new Date(selectedLeave.decisionAt).toLocaleString() : 'Pending Decision'}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#74796D] dark:text-[#8D9686] block mb-1">
                Stated Justification:
              </span>
              <div className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] text-[#242820] dark:text-white leading-relaxed">
                {selectedLeave.reason}
              </div>
            </div>

            {/* Supporting Document */}
            {selectedLeave.documentUrl && (
              <div className="p-3 rounded-xl bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-[#52613B] dark:text-[#B2D297]" />
                <span className="font-semibold text-xs text-[#242820] dark:text-white">Supporting Document Reference:</span>
                <span className="font-mono text-xs text-[#52613B] dark:text-[#B2D297]">{selectedLeave.documentUrl}</span>
              </div>
            )}

            {/* Faculty Recommendation */}
            {selectedLeave.facultyRecommendation && (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[#386A91] dark:text-sky-300 space-y-1">
                <strong className="text-xs font-bold block">Class Faculty Recommendation:</strong>
                <p className="italic text-xs">"{selectedLeave.facultyRecommendation}"</p>
                {selectedLeave.recommendedByName && (
                  <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] block text-right">
                    Instructor: {selectedLeave.recommendedByName}
                  </span>
                )}
              </div>
            )}

            {/* Reviewer remarks if finalized */}
            {selectedLeave.reviewerRemarks && (
              <div className="p-3.5 rounded-xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] space-y-1">
                <strong className="text-xs font-bold text-[#242820] dark:text-white block">
                  Administrative Reviewer Decision Remarks:
                </strong>
                <p className="text-xs text-[#555B50] dark:text-[#CAD6B7]">
                  "{selectedLeave.reviewerRemarks}"
                </p>
                {selectedLeave.reviewerName && (
                  <span className="text-[10px] text-[#74796D] dark:text-[#8D9686] block text-right">
                    Reviewer: {selectedLeave.reviewerName}
                  </span>
                )}
              </div>
            )}

            <div className="pt-3 flex justify-end border-t border-[#E3E1D6] dark:border-[#283623]">
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLeave(null);
                }}
                className="btn-secondary text-xs font-semibold py-2 px-4 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default LeaveRequestsPage;
