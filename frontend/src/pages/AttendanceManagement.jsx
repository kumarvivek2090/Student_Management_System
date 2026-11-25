import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
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
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState([]);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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

      // Auto-select first class and section to avoid blank screen
      if (classList.length > 0) {
        const firstClass = classList[0];
        setSelectedClass(firstClass.id);
        const secList = firstClass.sections || [];
        setSections(secList);

        if (secList.length > 0) {
          const firstSec = secList[0];
          setSelectedSection(firstSec.id);
          // Automatically fetch roster for first class & section for today
          fetchRoster(firstClass.id, firstSec.id, attendanceDate);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load academic classes');
    } finally {
      setLoadingSetup(false);
    }
  };

  // 2. Fetch Roster & Existing Attendance Records
  const fetchRoster = async (classId, sectionId, date) => {
    if (!classId || !sectionId || !date) return;
    setLoadingRoster(true);

    try {
      const [sRes, aRes] = await Promise.all([
        api.get('/students', { params: { classId, sectionId } }),
        api.get(`/attendance/class/${classId}/section/${sectionId}`, { params: { date } }),
      ]);

      const students = sRes.data?.data || [];
      const attendanceList = aRes.data?.data || [];

      const existingMap = new Map();
      attendanceList.forEach((r) => existingMap.set(r.studentId, r));

      const rows = students.map((st) => {
        const er = existingMap.get(st.id);
        return {
          studentId: st.id,
          fullName: st.fullName,
          studentCode: st.studentId,
          rollNumber: st.rollNumber || '—',
          status: er ? er.status : 'PRESENT', // default to PRESENT
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

  // Handler: Change Class
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setRoster([]);

    const foundClass = classes.find((c) => c.id === classId);
    const secList = foundClass?.sections || [];
    setSections(secList);

    if (secList.length > 0) {
      const firstSecId = secList[0].id;
      setSelectedSection(firstSecId);
      fetchRoster(classId, firstSecId, attendanceDate);
    } else {
      setSelectedSection('');
    }
  };

  // Handler: Change Section
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    if (selectedClass && sectionId) {
      fetchRoster(selectedClass, sectionId, attendanceDate);
    } else {
      setRoster([]);
    }
  };

  // Handler: Change Date
  const handleDateChange = (date) => {
    setAttendanceDate(date);
    if (selectedClass && selectedSection) {
      fetchRoster(selectedClass, selectedSection, date);
    }
  };

  // Set quick date
  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    handleDateChange(dateStr);
  };

  // Status toggle for single student
  const handleStatusChange = (index, status) => {
    const updated = [...roster];
    updated[index].status = status;
    setRoster(updated);
    setIsDirty(true);
  };

  // Remarks change for single student
  const handleRemarkChange = (index, val) => {
    const updated = [...roster];
    updated[index].remarks = val;
    setRoster(updated);
    setIsDirty(true);
  };

  // Batch action: Mark all with status
  const handleMarkAll = (status) => {
    const updated = roster.map((r) => ({ ...r, status }));
    setRoster(updated);
    setIsDirty(true);
    toast.success(`Marked all ${roster.length} students as ${status}`);
  };

  // Save to backend Neon Cloud PostgreSQL
  const handleSaveAttendance = async () => {
    if (roster.length === 0 || !selectedClass || !selectedSection) return;
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
        toast.success(`Attendance records for ${attendanceDate} saved to Neon!`);
        setIsDirty(false);
        // Mark all as recorded in UI
        setRoster((prev) => prev.map((r) => ({ ...r, recorded: true })));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  // Computed metrics for the roster
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#242820] font-serif">Daily Attendance Register</h2>
          <p className="text-xs text-[#555B50] mt-0.5">
            Record and track student daily session attendance with status validation and historical logging.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Unsaved Attendance Changes</span>
          </div>
        )}
      </div>

      {/* Selectors Card */}
      <div className="card-premium p-5 bg-[#F8F7F2] border border-[#E3E1D6]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          
          {/* Class */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClass}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none disabled:bg-[#F0EFE6] disabled:text-[#74796D]"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          {/* Attendance Date */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none"
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
                  : 'bg-white hover:bg-[#F0EFE6] text-[#242820] border-[#E3E1D6]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(-1)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#F0EFE6] border border-[#E3E1D6] text-[#242820] text-xs font-semibold transition-colors cursor-pointer"
            >
              Yesterday
            </button>
          </div>

        </div>
      </div>

      {/* Roster & Attendance Grid */}
      {loadingSetup || loadingRoster ? (
        <LoadingSpinner message="Retrieving daily attendance roster from Neon Cloud PostgreSQL..." />
      ) : roster.length > 0 ? (
        <div className="space-y-4">
          
          {/* KPI Summary Bar & Bulk Status Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* KPI Counters */}
            <div className="md:col-span-7 flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white px-3 py-2 rounded-xl border border-[#E3E1D6] shadow-xs flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-[#52613B]" />
                <span className="text-[#555B50]">Total:</span>
                <strong className="text-[#242820]">{metrics?.total}</strong>
              </div>

              <div className="bg-emerald-50 text-[#247A55] border border-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Present: <strong>{metrics?.present}</strong> ({metrics?.presentRate}%)</span>
              </div>

              {metrics?.absent > 0 && (
                <div className="bg-red-50 text-[#B84040] border border-red-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Absent: <strong>{metrics.absent}</strong></span>
                </div>
              )}

              {metrics?.late > 0 && (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Late: <strong>{metrics.late}</strong></span>
                </div>
              )}

              {metrics?.excused > 0 && (
                <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Excused: <strong>{metrics.excused}</strong></span>
                </div>
              )}
            </div>

            {/* Bulk Actions & Save Button */}
            <div className="md:col-span-5 flex items-center justify-end space-x-2">
              <div className="flex items-center space-x-1 bg-white border border-[#E3E1D6] rounded-xl p-1 shadow-xs text-xs">
                <span className="text-[10px] uppercase font-bold text-[#74796D] px-2">Set All:</span>
                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#247A55] font-bold text-[11px] transition-colors cursor-pointer"
                  title="Mark all students Present"
                >
                  P (Present)
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-[#B84040] font-bold text-[11px] transition-colors cursor-pointer"
                  title="Mark all students Absent"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('LATE')}
                  className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] transition-colors cursor-pointer"
                  title="Mark all students Late"
                >
                  L
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="py-2 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card hover:shadow-card-hover transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Register'}</span>
              </button>
            </div>

          </div>

          {/* Roster Table Card */}
          <div className="card-premium overflow-hidden bg-white border border-[#E3E1D6] rounded-2xl shadow-card">
            
            {/* Card Header */}
            <div className="p-4 border-b border-[#E3E1D6] bg-[#F8F7F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#242820]">
                  Session Register: {classes.find((c) => c.id === selectedClass)?.name} — Section {sections.find((s) => s.id === selectedSection)?.name}
                </h3>
                <p className="text-[11px] text-[#555B50] mt-0.5">
                  Date: <strong className="text-[#242820]">{attendanceDate}</strong> • Total Enrolled: <strong className="text-[#52613B]">{roster.length} Scholars</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-[#52613B] bg-[#F0EFE6] border border-[#E3E1D6] px-2.5 py-1 rounded-full">
                  PostgreSQL Session Persistence
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
                <thead className="bg-[#F0EFE6] text-[#242820] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 w-16">Roll</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Student ID</th>
                    <th className="px-4 py-3.5 text-center w-80">Attendance Status</th>
                    <th className="px-4 py-3.5">Attendance Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E1D6] bg-white">
                  {roster.map((st, idx) => {
                    const status = st.status;
                    return (
                      <tr key={st.studentId} className="hover:bg-[#F8F7F2] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#242820]">{st.rollNumber}</td>
                        <td className="px-4 py-3 font-semibold text-[#242820]">{st.fullName}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#555B50]">{st.studentCode}</td>
                        
                        {/* Interactive Status Pill Buttons */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                status === 'PRESENT'
                                  ? 'bg-[#247A55] text-white shadow-xs scale-105'
                                  : 'bg-[#F0EFE6] text-[#555B50] hover:bg-emerald-100 hover:text-[#247A55]'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Present</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                status === 'ABSENT'
                                  ? 'bg-[#B84040] text-white shadow-xs scale-105'
                                  : 'bg-[#F0EFE6] text-[#555B50] hover:bg-red-100 hover:text-[#B84040]'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              <span>Absent</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'LATE')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                status === 'LATE'
                                  ? 'bg-[#D97706] text-white shadow-xs scale-105'
                                  : 'bg-[#F0EFE6] text-[#555B50] hover:bg-amber-100 hover:text-amber-800]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>Late</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'EXCUSED')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                status === 'EXCUSED'
                                  ? 'bg-[#386A91] text-white shadow-xs scale-105'
                                  : 'bg-[#F0EFE6] text-[#555B50] hover:bg-blue-100 hover:text-blue-800]'
                              }`}
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Excused</span>
                            </button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={st.remarks}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            placeholder="e.g. Authorized medical leave"
                            className="w-full py-1.5 px-3 rounded-lg border border-[#E3E1D6] bg-white text-xs text-[#242820] placeholder-[#74796D] outline-none focus:border-[#52613B]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-[#F8F7F2] border-t border-[#E3E1D6] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#555B50]">
                Daily attendance updates automatically sync with student portal reports and guardians.
              </span>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-2 shadow-card transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Daily Attendance Register'}</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="card-premium p-10 bg-white border border-[#E3E1D6] rounded-2xl text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EFE6] border border-[#E3E1D6] flex items-center justify-center mx-auto text-[#52613B]">
            <ClipboardCheck className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#242820] font-serif">
              No Students Found in this Class Section
            </h3>
            <p className="text-xs text-[#555B50] mt-1.5 leading-relaxed">
              Select another class or section above to load the student attendance roster.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
