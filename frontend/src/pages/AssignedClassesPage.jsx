import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Layers, Users, BookOpen, Award, ClipboardCheck, ArrowRight, Eye, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const AssignedClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      if (res.data?.success) {
        setClasses(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load assigned classes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoster = async (cls) => {
    setSelectedClass(cls);
    setShowRosterModal(true);
    setRosterLoading(true);
    try {
      const res = await api.get('/students?page=0&size=50');
      if (res.data?.success) {
        const roster = res.data.data?.content || res.data.data || [];
        setStudents(roster.filter(s => s.className === cls.name || s.classId === cls.id));
      }
    } catch (e) {
      toast.error('Failed to load student roster');
    } finally {
      setRosterLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Faculty Academic Assignment
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Active Term: 2026-2027</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">My Assigned Classes & Student Cohorts</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Manage instructional cohorts, student rosters, assessment recording, and daily class registers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/marks/entry"
            className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Launch Marks Entry</span>
          </Link>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="card-premium p-6 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E4EAD9] text-[#52613B] flex items-center justify-center font-bold border border-[#CAD6B7]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#52613B] text-white px-2 py-0.5 rounded-full">
                  Assigned
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#242820]">{cls.name}</h3>
                <p className="text-xs text-[#555B50] font-medium mt-0.5">{cls.description || 'Core Academic Curriculum Cohort'}</p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-[#555B50]">
                <div className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6]">
                  <p className="text-[10px] font-bold text-[#74796D] uppercase">Section</p>
                  <p className="font-bold text-[#242820] mt-0.5">Section A</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6]">
                  <p className="text-[10px] font-bold text-[#74796D] uppercase">Grade Level</p>
                  <p className="font-bold text-[#242820] mt-0.5">Level {cls.gradeLevel}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EFE6] space-y-2">
              <button
                onClick={() => handleOpenRoster(cls)}
                className="w-full btn-secondary text-xs font-bold py-2 flex items-center justify-center space-x-2"
              >
                <Users className="w-3.5 h-3.5 text-[#52613B]" />
                <span>View Class Roster</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/marks/entry"
                  className="btn-secondary text-center text-xs font-bold py-1.5 text-[#52613B]"
                >
                  Enter Marks
                </Link>
                <Link
                  to="/attendance"
                  className="btn-secondary text-center text-xs font-bold py-1.5 text-[#52613B]"
                >
                  Take Attendance
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roster Modal */}
      <Modal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        title={`Student Roster: ${selectedClass?.name} - Section A`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#555B50]">
            Officially enrolled students in this academic cohort.
          </p>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E3E1D6] border border-[#E3E1D6] rounded-xl">
            {rosterLoading ? (
              <p className="p-6 text-center text-xs text-[#74796D]">Loading roster...</p>
            ) : students.length > 0 ? (
              students.map((st) => (
                <div key={st.id} className="p-3 hover:bg-[#F8F7F2] transition-colors flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#242820]">{st.fullName}</p>
                    <p className="text-[11px] text-[#555B50] font-mono">Roll: {st.rollNumber} | ID: {st.studentId}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#52613B] bg-[#E4EAD9] px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-[#74796D]">No students currently enrolled in this section.</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowRosterModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignedClassesPage;
