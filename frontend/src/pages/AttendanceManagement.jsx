import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { ClipboardCheck, Save, Calendar, Check, X, Clock, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data.success) setClasses(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setRoster([]);
    if (classId) {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) setSections(res.data.data);
    } else {
      setSections([]);
    }
  };

  const handleFetchRoster = async () => {
    if (!selectedClass || !selectedSection || !attendanceDate) {
      toast.error('Please select class, section, and date');
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch students for class & section
      const sRes = await api.get('/students', {
        params: { classId: selectedClass, sectionId: selectedSection },
      });

      // 2. Fetch existing attendance for this class, section, and date
      const aRes = await api.get(`/attendance/class/${selectedClass}/section/${selectedSection}`, {
        params: { date: attendanceDate },
      });

      const existingMap = new Map();
      if (aRes.data.success) {
        aRes.data.data.forEach((r) => existingMap.set(r.studentId, r));
      }

      const rows = sRes.data.data.map((st) => {
        const er = existingMap.get(st.id);
        return {
          studentId: st.id,
          fullName: st.fullName,
          studentCode: st.studentId,
          rollNumber: st.rollNumber,
          status: er ? er.status : 'PRESENT', // default present
          remarks: er ? er.remarks || '' : '',
        };
      });

      setRoster(rows);
    } catch (e) {
      toast.error('Failed to load class attendance roster');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (index, status) => {
    const updated = [...roster];
    updated[index].status = status;
    setRoster(updated);
  };

  const handleRemarkChange = (index, val) => {
    const updated = [...roster];
    updated[index].remarks = val;
    setRoster(updated);
  };

  const handleMarkAll = (status) => {
    const updated = roster.map((r) => ({ ...r, status }));
    setRoster(updated);
  };

  const handleSaveAttendance = async () => {
    if (roster.length === 0) return;
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
        toast.success('Attendance records saved to Neon PostgreSQL successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-charcoal">Attendance Management</h2>
        <p className="text-xs text-muted">
          Record and track student daily session attendance with status validation and historical logging
        </p>
      </div>

      {/* Selector Card */}
      <div className="card-premium p-6 bg-cream/30">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="input-field text-xs py-2"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setRoster([]);
              }}
              disabled={!selectedClass}
              className="input-field text-xs py-2 disabled:bg-cream/70"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="input-field text-xs py-2"
            />
          </div>

          <button
            onClick={handleFetchRoster}
            disabled={!selectedClass || !selectedSection}
            className="btn-primary text-xs py-2.5 shadow-sm"
          >
            Load Student Roster
          </button>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <LoadingSpinner message="Retrieving attendance session records from Neon..." />
      ) : roster.length > 0 ? (
        <div className="card-premium overflow-hidden">
          <div className="p-4 border-b border-warmgrey/70 bg-cream/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-charcoal">Quick Fill:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-red-100 text-red-800 border border-red-300 hover:bg-red-200"
              >
                All Absent
              </button>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Attendance Session'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-warmgrey/60 text-left text-xs">
              <thead className="bg-cream/60 text-muted font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3 text-center">Attendance Status</th>
                  <th className="px-4 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgrey/40 bg-white">
                {roster.map((st, idx) => (
                  <tr key={st.studentId} className="hover:bg-ivory/50">
                    <td className="px-4 py-3 font-semibold text-charcoal">{st.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{st.fullName}</td>
                    <td className="px-4 py-3 text-muted">{st.studentCode}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-lg border border-warmgrey p-0.5 bg-cream/30">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((stOpt) => {
                          const isSel = st.status === stOpt;
                          let activeClass = 'bg-olive-500 text-white';
                          if (stOpt === 'ABSENT') activeClass = 'bg-red-600 text-white';
                          if (stOpt === 'LATE') activeClass = 'bg-amber-600 text-white';
                          if (stOpt === 'EXCUSED') activeClass = 'bg-blue-600 text-white';

                          return (
                            <button
                              key={stOpt}
                              type="button"
                              onClick={() => handleStatusChange(idx, stOpt)}
                              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                                isSel ? activeClass : 'text-muted hover:text-charcoal'
                              }`}
                            >
                              {stOpt}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={st.remarks}
                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                        placeholder="Optional remarks (e.g. Doctor note)"
                        className="w-full input-field py-1 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-cream/30 border-t border-warmgrey/60 flex items-center justify-between">
            <span className="text-xs text-muted">
              Roster: {roster.length} students recorded for session on {attendanceDate}
            </span>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Attendance Session'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AttendanceManagement;
