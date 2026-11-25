import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  ClipboardCheck,
  Save,
  Calendar,
  Check,
  X,
  Clock,
  HelpCircle,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Lock,
  Unlock,
  ShieldCheck,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Active Tab for Admin: 'register' | 'overview'
  const [activeTab, setActiveTab] = useState('register');

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState([]);
  const [lockStatus, setLockStatus] = useState(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Admin Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correcting, setCorrecting] = useState(false);

  // Admin Overview State
  const [overviewData, setOverviewData] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // 1. Initial Load of Classes
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoadingSetup(true);
    try {
      const res = await api.get('/classes');
      const classList = res.data?.data || [];
      setClasses(classList);

      if (classList.length > 0) {
        const firstClass = classList[0];
        setSelectedClass(firstClass.id);
        const secList = firstClass.sections || [];
        setSections(secList);

        if (secList.length > 0) {
          const firstSec = secList[0];
          setSelectedSection(firstSec.id);
          fetchRosterAndLockStatus(firstClass.id, firstSec.id, attendanceDate);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load academic classes');
    } finally {
      setLoadingSetup(false);
    }
  };

  // 2. Fetch Roster & Lock Status
  const fetchRosterAndLockStatus = async (classId, sectionId, date) => {
    if (!classId || !sectionId || !date) return;
    setLoadingRoster(true);

    try {
      const [sRes, aRes, statusRes] = await Promise.all([
        api.get('/students', { params: { classId, sectionId } }),
        api.get(`/attendance/class/${classId}/section/${sectionId}`, { params: { date } }),
        api.get('/attendance/lock-status', { params: { classId, sectionId, date } }).catch(() => null),
      ]);

      const students = sRes.data?.data || [];
      const attendanceList = aRes.data?.data || [];
      const rawLockData = statusRes?.data?.data || null;
      const lockData = rawLockData ? {
        ...rawLockData,
        isLocked: rawLockData.isLocked ?? rawLockData.locked ?? false,
        isSubmitted: rawLockData.isSubmitted ?? rawLockData.submitted ?? false,
      } : null;

      setLockStatus(lockData);

      const existingMap = new Map();
      attendanceList.forEach((r) => existingMap.set(r.studentId, r));

      const rows = students.map((st) => {
        const er = existingMap.get(st.id);
        return {
          studentId: st.id,
          fullName: st.fullName,
          studentCode: st.studentId,
          rollNumber: st.rollNumber || '—',
          status: er ? er.status : 'PRESENT',
          remarks: er ? er.remarks || '' : '',
          recorded: !!er,
        };
      });

      setRoster(rows);
      setIsDirty(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load class attendance records');
    } finally {
      setLoadingRoster(false);
    }
  };

  // 3. Fetch Admin Overview
  const fetchAdminOverview = async (date) => {
    setLoadingOverview(true);
    try {
      const res = await api.get('/attendance/admin/overview', { params: { date } });
      const rows = (res.data?.data || []).map((r) => ({
        ...r,
        isSubmitted: r.isSubmitted ?? r.submitted ?? false,
      }));
      setOverviewData(rows);
    } catch (e) {
      toast.error('Could not load administrative attendance overview');
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' && isAdmin) {
      fetchAdminOverview(attendanceDate);
    }
  }, [activeTab, attendanceDate, isAdmin]);

  // Handlers for Class / Section / Date
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setRoster([]);

    const foundClass = classes.find((c) => c.id === classId);
    const secList = foundClass?.sections || [];
    setSections(secList);

    if (secList.length > 0) {
      const firstSecId = secList[0].id;
      setSelectedSection(firstSecId);
      fetchRosterAndLockStatus(classId, firstSecId, attendanceDate);
    } else {
      setSelectedSection('');
      setLockStatus(null);
    }
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    if (selectedClass && sectionId) {
      fetchRosterAndLockStatus(selectedClass, sectionId, attendanceDate);
    } else {
      setRoster([]);
      setLockStatus(null);
    }
  };

  const handleDateChange = (date) => {
    setAttendanceDate(date);
    if (selectedClass && selectedSection) {
      fetchRosterAndLockStatus(selectedClass, selectedSection, date);
    }
    if (activeTab === 'overview' && isAdmin) {
      fetchAdminOverview(date);
    }
  };

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    handleDateChange(dateStr);
  };

  // Student Attendance Row Modification
  const handleStatusChange = (index, status) => {
    if (lockStatus?.isLocked && !isAdmin) {
      toast.error('Attendance register is permanently locked for this session.');
      return;
    }
    const updated = [...roster];
    updated[index].status = status;
    setRoster(updated);
    setIsDirty(true);
  };

  const handleRemarkChange = (index, val) => {
    if (lockStatus?.isLocked && !isAdmin) return;
    const updated = [...roster];
    updated[index].remarks = val;
    setRoster(updated);
    setIsDirty(true);
  };

  const handleMarkAll = (status) => {
    if (lockStatus?.isLocked && !isAdmin) {
      toast.error('Attendance register is permanently locked.');
      return;
    }
    const updated = roster.map((r) => ({ ...r, status }));
    setRoster(updated);
    setIsDirty(true);
    toast.success(`Marked all ${roster.length} students as ${status}`);
  };

  // Save One-Time Attendance
  const handleSaveAttendance = async () => {
    if (roster.length === 0 || !selectedClass || !selectedSection) return;

    if (lockStatus?.isSubmitted && !isAdmin) {
      toast.error('Attendance has already been permanently submitted for this class and date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        attendanceDate: attendanceDate,
        attendanceList: roster.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await api.post('/attendance/bulk', payload);
      if (res.data.success) {
        toast.success('Attendance Submitted Successfully!');
        setIsDirty(false);
        // Refresh lock status & roster
        fetchRosterAndLockStatus(selectedClass, selectedSection, attendanceDate);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit attendance';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Admin Authorized Correction
  const handleAdminCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctionReason.trim() || correctionReason.trim().length < 5) {
      toast.error('A mandatory justification reason (at least 5 characters) is required for audit logging.');
      return;
    }

    setCorrecting(true);
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        attendanceDate: attendanceDate,
        reason: correctionReason.trim(),
        corrections: roster.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await api.post('/attendance/correct', payload);
      if (res.data.success) {
        toast.success('Administrative correction authorized and persisted to Neon PostgreSQL!');
        setShowCorrectionModal(false);
        setCorrectionReason('');
        setIsDirty(false);
        fetchRosterAndLockStatus(selectedClass, selectedSection, attendanceDate);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to authorize correction');
    } finally {
      setCorrecting(false);
    }
  };

  // Computed metrics for current roster
  const metrics = useMemo(() => {
    const total = roster.length;
    if (!total) return null;
    const present = roster.filter((r) => r.status === 'PRESENT').length;
    const absent = roster.filter((r) => r.status === 'ABSENT').length;
    const late = roster.filter((r) => r.status === 'LATE').length;
    const excused = roster.filter((r) => r.status === 'EXCUSED').length;
    const presentRate = ((present / total) * 100).toFixed(0);
    return { total, present, absent, late, excused, presentRate };
  }, [roster]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-[#242820] dark:text-white font-serif">
              Attendance Management Center
            </h2>
            {lockStatus?.isSubmitted ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] dark:bg-[#1A261B] text-[#198754] border border-[#BCE1C5] dark:border-[#284E2D]">
                <Lock className="w-3 h-3" />
                <span>Submitted & Locked</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Unlock className="w-3 h-3" />
                <span>Open for Submission</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-0.5">
            Strict one-time daily attendance register with server-side validation and administrative correction audit.
          </p>
        </div>

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="flex items-center bg-[#F0EFE6] dark:bg-[#131A12] p-1 rounded-xl border border-[#E3E1D6] dark:border-[#283623] text-xs">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820]'
              }`}
            >
              Class Register
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-[#182216] text-[#242820] dark:text-white shadow-xs'
                  : 'text-[#555B50] dark:text-[#CAD6B7] hover:text-[#242820]'
              }`}
            >
              Institutional Overview
            </button>
          </div>
        )}
      </div>

      {/* 2. ADMIN INSTITUTIONAL OVERVIEW TAB */}
      {isAdmin && activeTab === 'overview' ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Date Picker Bar */}
          <div className="card-premium p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#52613B] dark:text-[#B2D297]" />
              <span className="text-xs font-bold text-[#242820] dark:text-white">Institutional Daily Submission Monitor</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="input-field text-xs py-1.5 px-3"
              />
              <button
                onClick={() => fetchAdminOverview(attendanceDate)}
                disabled={loadingOverview}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingOverview ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Overview Table */}
          <div className="card-premium overflow-hidden bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E3E1D6] dark:divide-[#283623] text-left text-xs">
                <thead className="bg-[#F8F7F2] dark:bg-[#131A12] text-[#555B50] dark:text-[#CAD6B7] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Academic Class</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Submitted By</th>
                    <th className="px-4 py-3">Submission Timestamp</th>
                    <th className="px-4 py-3 text-center">Present / Enrolled</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E1D6] dark:divide-[#283623] bg-white dark:bg-[#182216]">
                  {loadingOverview ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <LoadingSpinner message="Checking institutional attendance submission status..." />
                      </td>
                    </tr>
                  ) : overviewData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-muted">
                        No active classes configured.
                      </td>
                    </tr>
                  ) : (
                    overviewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F7F2] dark:hover:bg-[#212C1D] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#242820] dark:text-white">{row.className}</td>
                        <td className="px-4 py-3 font-semibold text-[#52613B] dark:text-[#B2D297]">Section {row.sectionName}</td>
                        <td className="px-4 py-3 text-center">
                          {row.isSubmitted ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Submitted</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#242820] dark:text-[#E8EDE4]">
                          {row.submittedByName || <span className="text-muted dark:text-[#7D8973]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[#555B50] dark:text-[#CAD6B7] font-mono text-[11px]">
                          {row.submittedAt ? new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-[#242820] dark:text-white">
                          {row.isSubmitted ? `${row.presentCount} / ${row.studentCount}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedClass(row.classId);
                              setSelectedSection(row.sectionId);
                              setActiveTab('register');
                              fetchRosterAndLockStatus(row.classId, row.sectionId, attendanceDate);
                            }}
                            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center space-x-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* 3. CLASS ATTENDANCE REGISTER TAB */
        <div className="space-y-6">
          {/* Selectors Card */}
          <div className="card-premium p-5 bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623]">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              {/* Class */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5 uppercase tracking-wider">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2.5 text-xs text-[#242820] dark:text-[#F3F6F0] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5 uppercase tracking-wider">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2.5 text-xs text-[#242820] dark:text-[#F3F6F0] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none disabled:bg-[#F0EFE6] dark:disabled:bg-[#0E140D] disabled:text-[#74796D] dark:disabled:text-[#616C5A]"
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>Section {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Date */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5 uppercase tracking-wider">
                  Attendance Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2.5 text-xs text-[#242820] dark:text-[#F3F6F0] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none"
                  />
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="sm:col-span-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    attendanceDate === new Date().toISOString().split('T')[0]
                      ? 'bg-[#52613B] text-white border-[#52613B]'
                      : 'bg-white dark:bg-[#182216] hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E] text-[#242820] dark:text-[#E8EDE4] border-[#E3E1D6] dark:border-[#2D3D27]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(-1)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-[#182216] hover:bg-[#F0EFE6] dark:hover:bg-[#222E1E] border border-[#E3E1D6] dark:border-[#2D3D27] text-[#242820] dark:text-[#E8EDE4] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>
          </div>

          {/* SUBMISSION LOCK STATUS BANNER */}
          {lockStatus?.isSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50/95 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#162215] dark:to-emerald-950/50 border border-emerald-200 dark:border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fadeIn transition-colors">
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-[#247A55] dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-white flex items-center space-x-2">
                    <span>Attendance Submitted Successfully</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-[#247A55] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      Locked
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800/90 dark:text-[#CAD6B7] mt-0.5 leading-relaxed">
                    Submitted on <strong className="text-emerald-950 dark:text-white font-bold">{new Date(lockStatus.submittedAt).toLocaleDateString()}</strong> at{' '}
                    <strong className="text-emerald-950 dark:text-white font-bold">{new Date(lockStatus.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> by{' '}
                    <strong className="text-[#247A55] dark:text-[#B2D297] font-bold">{lockStatus.submittedByName}</strong>.
                    {!isAdmin && ' Register is locked in read-only mode to prevent duplicate submissions.'}
                  </p>
                </div>
              </div>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm shrink-0 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Correction</span>
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-900 dark:text-[#CAD6B7] bg-white dark:bg-[#131A12] px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-[#283623] shadow-xs shrink-0 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#247A55] dark:text-[#B2D297]" />
                  <span>Read-Only Mode</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Notice:</strong> Daily attendance has not yet been submitted for this session. Once saved, it will be locked according to institutional policy.
                </span>
              </div>
            </div>
          )}

          {/* Roster & Attendance Grid */}
          {loadingSetup || loadingRoster ? (
            <LoadingSpinner message="Retrieving daily attendance roster from Neon Cloud PostgreSQL..." />
          ) : roster.length > 0 ? (
            <div className="space-y-4">
              {/* KPI Summary Bar & Bulk Status Actions */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* KPI Counters */}
                <div className="md:col-span-7 flex flex-wrap items-center gap-2 text-xs">
                  <div className="card-premium px-3 py-2 rounded-xl border border-[#E3E1D6] dark:border-[#283623] flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-[#52613B] dark:text-[#B2D297]" />
                    <span className="text-[#555B50] dark:text-[#CAD6B7]">Enrolled:</span>
                    <strong className="text-[#242820] dark:text-white">{metrics?.total}</strong>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/60 text-[#247A55] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present: <strong>{metrics?.present}</strong> ({metrics?.presentRate}%)</span>
                  </div>

                  {metrics?.absent > 0 && (
                    <div className="bg-red-50 dark:bg-rose-950/60 text-[#B84040] dark:text-rose-300 border border-red-200 dark:border-rose-800/60 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent: <strong>{metrics.absent}</strong></span>
                    </div>
                  )}

                  {metrics?.late > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Late: <strong>{metrics.late}</strong></span>
                    </div>
                  )}

                  {metrics?.excused > 0 && (
                    <div className="bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800/60 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>Excused: <strong>{metrics.excused}</strong></span>
                    </div>
                  )}
                </div>

                {/* Bulk Actions & Submit Button */}
                <div className="md:col-span-5 flex items-center justify-end space-x-2">
                  {(!lockStatus?.isSubmitted || isAdmin) && (
                    <div className="flex items-center space-x-1 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-xl p-1 shadow-xs text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#74796D] dark:text-[#A8B49E] px-2">Set All:</span>
                      <button
                        type="button"
                        onClick={() => handleMarkAll('PRESENT')}
                        className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-[#247A55] dark:text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Mark all students Present"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAll('ABSENT')}
                        className="px-2 py-1 rounded-lg bg-red-100 dark:bg-rose-950/70 hover:bg-red-200 dark:hover:bg-rose-900 text-[#B84040] dark:text-rose-300 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Mark all students Absent"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAll('LATE')}
                        className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Mark all students Late"
                      >
                        L
                      </button>
                    </div>
                  )}

                  {!lockStatus?.isSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className="py-2 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card hover:shadow-card-hover transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Submitting...' : 'Submit Attendance'}</span>
                    </button>
                  ) : isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setShowCorrectionModal(true)}
                      className="py-2 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authorize Changes</span>
                    </button>
                  ) : (
                    <div className="py-2 px-3.5 rounded-xl bg-[#F0EFE6] dark:bg-[#1A2217] text-[#555B50] dark:text-[#CAD6B7] text-xs font-bold flex items-center space-x-1.5 border border-[#E3E1D6] dark:border-[#283623]">
                      <Lock className="w-3.5 h-3.5 text-[#74796D] dark:text-[#8D9686]" />
                      <span>Register Locked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Roster Table Card */}
              <div className="card-premium overflow-hidden bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl shadow-card">
                {/* Card Header */}
                <div className="p-4 border-b border-[#E3E1D6] dark:border-[#283623] bg-[#F8F7F2] dark:bg-[#131A12] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#242820] dark:text-white">
                      Session Register: {classes.find((c) => c.id === selectedClass)?.name} — Section {sections.find((s) => s.id === selectedSection)?.name}
                    </h3>
                    <p className="text-[11px] text-[#555B50] dark:text-[#CAD6B7] mt-0.5">
                      Date: <strong className="text-[#242820] dark:text-white">{attendanceDate}</strong> • Enrolled: <strong className="text-[#52613B] dark:text-[#B2D297]">{roster.length} Scholars</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-[#52613B] dark:text-[#B2D297] bg-[#F0EFE6] dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] px-2.5 py-1 rounded-full">
                      Neon Serverless Integrity
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E3E1D6] dark:divide-[#283623] text-left text-xs">
                    <thead className="bg-[#F0EFE6] dark:bg-[#131A12] text-[#242820] dark:text-[#CAD6B7] font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3.5 w-16">Roll</th>
                        <th className="px-4 py-3.5">Student Name</th>
                        <th className="px-4 py-3.5">Student ID</th>
                        <th className="px-4 py-3.5 text-center w-80">Attendance Status</th>
                        <th className="px-4 py-3.5">Attendance Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E1D6] dark:divide-[#283623] bg-white dark:bg-[#182216]">
                      {roster.map((st, idx) => {
                        const status = st.status;
                        const isLockedRow = lockStatus?.isLocked && !isAdmin;

                        return (
                          <tr key={st.studentId} className="hover:bg-[#F8F7F2] dark:hover:bg-[#212C1D] transition-colors">
                            <td className="px-4 py-3 font-bold text-[#242820] dark:text-white">{st.rollNumber}</td>
                            <td className="px-4 py-3 font-semibold text-[#242820] dark:text-white">{st.fullName}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-[#555B50] dark:text-[#CAD6B7]">{st.studentCode}</td>

                            {/* Status Buttons */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  type="button"
                                  disabled={isLockedRow}
                                  onClick={() => handleStatusChange(idx, 'PRESENT')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    isLockedRow ? 'cursor-not-allowed opacity-80 ' : 'cursor-pointer '
                                  }${
                                    status === 'PRESENT'
                                      ? 'bg-[#247A55] text-white shadow-xs'
                                      : 'bg-[#F0EFE6] dark:bg-[#131A12] text-[#555B50] dark:text-[#CAD6B7] hover:bg-emerald-100 dark:hover:bg-emerald-950/70 hover:text-[#247A55] dark:hover:text-emerald-300'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Present</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isLockedRow}
                                  onClick={() => handleStatusChange(idx, 'ABSENT')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    isLockedRow ? 'cursor-not-allowed opacity-80 ' : 'cursor-pointer '
                                  }${
                                    status === 'ABSENT'
                                      ? 'bg-[#B84040] text-white shadow-xs'
                                      : 'bg-[#F0EFE6] dark:bg-[#131A12] text-[#555B50] dark:text-[#CAD6B7] hover:bg-red-100 dark:hover:bg-rose-950/70 hover:text-[#B84040] dark:hover:text-rose-300'
                                  }`}
                                >
                                  <X className="w-3 h-3" />
                                  <span>Absent</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isLockedRow}
                                  onClick={() => handleStatusChange(idx, 'LATE')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    isLockedRow ? 'cursor-not-allowed opacity-80 ' : 'cursor-pointer '
                                  }${
                                    status === 'LATE'
                                      ? 'bg-[#D97706] text-white shadow-xs'
                                      : 'bg-[#F0EFE6] dark:bg-[#131A12] text-[#555B50] dark:text-[#CAD6B7] hover:bg-amber-100 dark:hover:bg-amber-950/70 hover:text-amber-800 dark:hover:text-amber-300'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Late</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isLockedRow}
                                  onClick={() => handleStatusChange(idx, 'EXCUSED')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    isLockedRow ? 'cursor-not-allowed opacity-80 ' : 'cursor-pointer '
                                  }${
                                    status === 'EXCUSED'
                                      ? 'bg-[#386A91] text-white shadow-xs'
                                      : 'bg-[#F0EFE6] dark:bg-[#131A12] text-[#555B50] dark:text-[#CAD6B7] hover:bg-blue-100 dark:hover:bg-sky-950/70 hover:text-blue-800 dark:hover:text-sky-300'
                                  }`}
                                >
                                  <HelpCircle className="w-3 h-3" />
                                  <span>Excused</span>
                                </button>
                              </div>
                            </td>

                            {/* Remarks */}
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                disabled={isLockedRow}
                                value={st.remarks}
                                onChange={(e) => handleRemarkChange(idx, e.target.value)}
                                placeholder={isLockedRow ? 'No remarks recorded' : 'e.g. Authorized medical leave'}
                                className="w-full py-1.5 px-3 rounded-lg border border-[#E3E1D6] dark:border-[#2D3D27] bg-white dark:bg-[#131A12] text-xs text-[#242820] dark:text-[#F3F6F0] placeholder-[#74796D] outline-none focus:border-[#52613B] disabled:opacity-75 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-[#F8F7F2] dark:bg-[#131A12] border-t border-[#E3E1D6] dark:border-[#283623] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#555B50] dark:text-[#CAD6B7]">
                    {lockStatus?.isSubmitted
                      ? `Locked attendance records cannot be duplicated. Official verification on ${attendanceDate}.`
                      : 'Once attendance is saved, it is locked permanently according to institutional daily policy.'}
                  </span>

                  {!lockStatus?.isSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className="py-2.5 px-5 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-2 shadow-card transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Submitting...' : 'Save Daily Attendance Register'}</span>
                    </button>
                  ) : isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setShowCorrectionModal(true)}
                      className="py-2.5 px-5 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-2 shadow-card transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize Changes with Reason</span>
                    </button>
                  ) : (
                    <div className="py-2 px-3.5 rounded-xl bg-[#F0EFE6] dark:bg-[#182216] text-[#555B50] dark:text-[#CAD6B7] text-xs font-bold flex items-center space-x-1.5 border border-[#E3E1D6] dark:border-[#283623]">
                      <Lock className="w-3.5 h-3.5 text-[#74796D] dark:text-[#8D9686]" />
                      <span>Register Locked</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-premium p-10 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#283623] rounded-2xl text-center space-y-4 shadow-subtle">
              <div className="w-14 h-14 rounded-2xl bg-[#F0EFE6] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] flex items-center justify-center mx-auto text-[#52613B] dark:text-[#B2D297]">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#242820] dark:text-white font-serif">
                  No Students Found in this Class Section
                </h3>
                <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] mt-1.5 leading-relaxed">
                  Select another class or section above to load the student attendance roster.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ADMIN ATTENDANCE CORRECTION MODAL */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Authorize Administrative Attendance Correction"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAdminCorrectionSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Administrative Correction Audit Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This action modifies permanently locked attendance records. Your user account, timestamp, and justification reason will be recorded in the institutional audit log.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-white mb-1">
              Mandatory Justification Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Authorized medical leave certificate verified by the school clinic on 2026-11-25."
              className="input-field text-xs w-full py-2"
            />
            <span className="text-[10px] text-[#74796D] dark:text-[#A8B49E]">
              Minimum 5 characters required. This note is appended to student remarks and permanent audit trails.
            </span>
          </div>

          <div className="pt-3 border-t border-[#E3E1D6] dark:border-[#283623] flex items-center justify-end space-x-3 text-xs">
            <button
              type="button"
              onClick={() => setShowCorrectionModal(false)}
              className="btn-secondary py-2 px-4"
              disabled={correcting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={correcting}
              className="btn-primary py-2 px-4 flex items-center space-x-1.5 font-bold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{correcting ? 'Persisting Audit...' : 'Authorize & Persist Correction'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
