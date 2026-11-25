import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, Plus, Trash2, Printer, Calendar, Users, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const TimetableManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form state
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '08:30',
    endTime: '09:30',
    subjectId: '',
    teacherId: '',
    roomNumber: 'Room 101'
  });

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [cRes, subRes, tRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teachers')
      ]);

      const subList = subRes.data?.data || [];
      const tList = tRes.data?.data || [];
      if (subRes.data?.success) setSubjects(subList);
      if (tRes.data?.success) setTeachers(tList);

      if (cRes.data?.success && cRes.data.data.length > 0) {
        setClasses(cRes.data.data);
        const firstClass = cRes.data.data[0];
        setSelectedClass(firstClass.id);

        const secRes = await api.get(`/classes/${firstClass.id}/sections`);
        if (secRes.data?.success && secRes.data.data.length > 0) {
          setSections(secRes.data.data);
          const firstSecId = secRes.data.data[0].id;
          setSelectedSection(firstSecId);
          loadTimetable(firstClass.id, firstSecId);
        }
      }

      if (subList.length > 0) {
        setFormData((prev) => ({ ...prev, subjectId: subList[0].id }));
      }
      if (tList.length > 0) {
        setFormData((prev) => ({ ...prev, teacherId: tList[0].id }));
      }
    } catch (e) {
      toast.error('Failed to load academic prerequisites');
    }
  };

  const loadTimetable = async (cId, sId) => {
    if (!cId || !sId) return;
    setLoading(true);
    try {
      const res = await api.get(`/timetables/class/${cId}/section/${sId}`);
      if (res.data?.success) {
        setSlots(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to retrieve class timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (cId) => {
    setSelectedClass(cId);
    try {
      const res = await api.get(`/classes/${cId}/sections`);
      if (res.data?.success && res.data.data.length > 0) {
        setSections(res.data.data);
        setSelectedSection(res.data.data[0].id);
        loadTimetable(cId, res.data.data[0].id);
      } else {
        setSections([]);
        setSelectedSection('');
        setSlots([]);
      }
    } catch (e) {
      toast.error('Failed to load sections');
    }
  };

  const handleOpenAddModal = () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select both a Target Class and Section first');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subjectId: prev.subjectId || (subjects.length > 0 ? subjects[0].id : ''),
      teacherId: prev.teacherId || (teachers.length > 0 ? teachers[0].id : ''),
    }));
    setShowAddModal(true);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) {
      toast.error('Target Class and Section must be selected');
      return;
    }
    if (!formData.subjectId || !formData.teacherId) {
      toast.error('Please select both a subject and teacher');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      toast.error('Period end time must be after start time');
      return;
    }
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
        roomNumber: formData.roomNumber || 'Room 101'
      };
      const res = await api.post('/timetables', payload);
      if (res.data?.success) {
        toast.success('Timetable period scheduled successfully');
        setShowAddModal(false);
        loadTimetable(selectedClass, selectedSection);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save timetable period');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await api.delete(`/timetables/${id}`);
      toast.success('Period removed');
      loadTimetable(selectedClass, selectedSection);
    } catch (e) {
      toast.error('Failed to delete period');
    }
  };

  const currentClass = classes.find((c) => c.id === selectedClass);
  const currentSection = sections.find((s) => s.id === selectedSection);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white dark:bg-[#182216] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6] dark:border-[#283623]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] dark:text-[#BCE39C] bg-[#E4EAD9] dark:bg-[#23311E] px-2.5 py-0.5 rounded-full border border-[#CAD6B7] dark:border-[#384E2F]">
              Academic Scheduling
            </span>
            <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-semibold">Weekly Master Register</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] dark:text-white mt-1 tracking-tight">Institutional Timetable Management</h2>
          <p className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-medium mt-0.5">
            Configure periodic instructional schedules, subject allotments, classrooms, and faculty assignments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs font-bold flex items-center space-x-2 py-2.5 px-3.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#52613B] dark:text-[#BCE39C]" />
            <span>Print Master Schedule</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class Period</span>
          </button>
        </div>
      </div>

      {/* Class & Section Selector Bar */}
      <div className="card-premium p-4 bg-[#F0EFE6]/60 dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623] flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#52613B] dark:text-[#BCE39C]" />
          <span className="text-xs font-bold text-[#242820] dark:text-white">Target Class:</span>
        </div>
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="bg-white dark:bg-[#182216] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-lg px-3 py-1.5 text-xs font-bold text-[#242820] dark:text-white focus:outline-none"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <span className="text-xs font-bold text-[#242820] dark:text-white ml-2">Section:</span>
        <select
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            loadTimetable(selectedClass, e.target.value);
          }}
          className="bg-white dark:bg-[#182216] border border-[#CAD6B7] dark:border-[#2D3D27] rounded-lg px-3 py-1.5 text-xs font-bold text-[#242820] dark:text-white focus:outline-none"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>Section {s.name}</option>
          ))}
        </select>

        <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-semibold ml-auto">
          Total Scheduled Periods: <strong className="text-[#52613B] dark:text-[#BCE39C] font-bold">{slots.length}</strong>
        </span>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="card-premium overflow-hidden border border-[#E3E1D6] dark:border-[#283623] flex flex-col bg-white dark:bg-[#182216]">
              <div className="p-3 bg-[#1D251A] text-white flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{day}</span>
                <span className="text-[10px] bg-[#52613B] px-2 py-0.5 rounded-full font-semibold">
                  {daySlots.length} Slots
                </span>
              </div>

              <div className="p-3 flex-1 space-y-3 bg-[#F8F7F2]/60 dark:bg-[#121811] min-h-[300px]">
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-white dark:bg-[#182216] rounded-xl border border-[#E3E1D6] dark:border-[#283623] shadow-sm hover:border-[#CAD6B7] dark:hover:border-[#3F4D2D] transition-all space-y-1.5 relative group"
                    >
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="absolute top-2 right-2 p-1 text-[#74796D] hover:text-[#B84040] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#52613B] dark:text-[#BCE39C]">
                        <Clock className="w-3 h-3" />
                        <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                      </div>

                      <p className="text-xs font-bold text-[#242820] dark:text-white leading-tight">{slot.subjectName}</p>
                      <p className="text-[11px] text-[#555B50] dark:text-[#CAD6B7] font-medium flex items-center space-x-1">
                        <Users className="w-3 h-3 text-[#74796D]" />
                        <span className="truncate">{slot.teacherName}</span>
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-[#74796D] dark:text-[#8D9686] border-t border-[#F0EFE6] dark:border-[#283623]">
                        <span>{slot.roomNumber}</span>
                        <span className="font-mono text-[#52613B] dark:text-[#BCE39C] font-bold">{slot.subjectCode}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-center text-xs text-[#74796D] dark:text-[#CAD6B7] font-medium">
                    No periods scheduled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule New Class Period"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {/* Target class/section banner */}
          <div className="p-3.5 rounded-xl bg-[#E4EAD9]/60 dark:bg-[#23311E] border border-[#CAD6B7] dark:border-[#384E2F] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#555B50] dark:text-[#CAD6B7] block text-[10px] uppercase font-bold tracking-wider">
                Target Allocation
              </span>
              <strong className="text-[#242820] dark:text-white font-bold">
                {currentClass?.name || 'Class'} — Section {currentSection?.name || 'Section'}
              </strong>
            </div>
            <span className="text-[10px] font-bold text-[#52613B] dark:text-[#BCE39C] bg-white dark:bg-[#182216] px-2.5 py-1 rounded-lg border border-[#CAD6B7] dark:border-[#384E2F]">
              Academic Year 2026-2027
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
                placeholder="e.g. Room 101, Lab A"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              required
            >
              <option value="">Select subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1">Faculty Instructor</label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white outline-none focus:border-[#52613B]"
              required
            >
              <option value="">Select faculty...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-[#E3E1D6] dark:border-[#283623]">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold shadow-md cursor-pointer"
            >
              Save Schedule Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableManagement;
