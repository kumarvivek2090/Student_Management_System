import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileCheck, Plus, Calendar, Clock, BookOpen, Layers, CheckCircle2, Award, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      if (aRes.data?.success) setAssignments(aRes.data.data || []);
      if (cRes.data?.success && cRes.data.data.length > 0) {
        setClasses(cRes.data.data);
        const firstC = cRes.data.data[0];
        setForm(prev => ({ ...prev, classId: firstC.id }));
        const secRes = await api.get(`/classes/${firstC.id}/sections`);
        if (secRes.data?.success && secRes.data.data.length > 0) {
          setSections(secRes.data.data);
          setForm(prev => ({ ...prev, sectionId: secRes.data.data[0].id }));
        }
      }
      if (subRes.data?.success) {
        setSubjects(subRes.data.data);
        if (subRes.data.data.length > 0) {
          setForm(prev => ({ ...prev, subjectId: subRes.data.data[0].id }));
        }
      }
    } catch (e) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        dueDate: new Date(form.dueDate).toISOString()
      };
      const res = await api.post('/assignments', payload);
      if (res.data?.success) {
        toast.success('Assignment published to students!');
        setShowCreateModal(false);
        loadData();
      }
    } catch (e) {
      toast.error('Failed to publish assignment');
    }
  };

  const handleOpenSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    try {
      const res = await api.get(`/assignments/${assignment.id}/submissions`);
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load student submissions');
    }
  };

  const handleGrade = async (subId) => {
    try {
      const res = await api.post(`/assignments/submissions/${subId}/grade`, {
        obtainedMarks: Number(gradeMarks),
        feedback: gradeFeedback
      });
      if (res.data?.success) {
        toast.success('Grade recorded!');
        setGradingSub(null);
        handleOpenSubmissions(selectedAssignment);
      }
    } catch (e) {
      toast.error('Failed to grade submission');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Coursework & Homework
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Active Assignments: {assignments.length}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Assignment Management & Grading</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Publish weekly homework, evaluate student problem sets, grade submissions, and provide qualitative feedback.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="card-premium p-5 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded border border-[#CAD6B7]">
                  {a.subjectCode} • {a.subjectName}
                </span>
                <Badge variant={a.status === 'ACTIVE' ? 'olive' : 'gold'}>{a.status}</Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#242820] leading-snug">{a.title}</h3>
                <p className="text-xs text-[#555B50] mt-1 line-clamp-2 leading-relaxed">{a.description}</p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-[#555B50]">
                <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6]">
                  <p className="text-[10px] font-bold text-[#74796D] uppercase">Target Cohort</p>
                  <p className="font-bold text-[#242820] mt-0.5">{a.className} - {a.sectionName}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6]">
                  <p className="text-[10px] font-bold text-[#74796D] uppercase">Max Points</p>
                  <p className="font-bold text-[#242820] mt-0.5">{a.maxMarks} Pts</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EFE6] space-y-2">
              <div className="flex items-center space-x-1.5 text-xs text-[#555B50]">
                <Calendar className="w-3.5 h-3.5 text-[#52613B]" />
                <span>Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Dec 01, 2026'}</span>
              </div>
              <button
                onClick={() => handleOpenSubmissions(a)}
                className="w-full btn-secondary text-xs font-bold py-2 flex items-center justify-center space-x-2"
              >
                <Users className="w-3.5 h-3.5 text-[#52613B]" />
                <span>Review Submissions</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Publish Coursework Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Target Class</label>
              <select
                value={form.classId}
                onChange={async (e) => {
                  setForm({ ...form, classId: e.target.value });
                  const res = await api.get(`/classes/${e.target.value}/sections`);
                  if (res.data?.success && res.data.data.length > 0) {
                    setSections(res.data.data);
                    setForm(prev => ({ ...prev, sectionId: res.data.data[0].id }));
                  }
                }}
                className="input-field text-xs font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Section</label>
              <select
                value={form.sectionId}
                onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Subject</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="input-field text-xs font-semibold"
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Assignment Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="e.g. Calculus Chapter 4 Problem Set"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-field text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Max Score</label>
              <input
                type="number"
                value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                className="input-field text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Description & Questions</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="Detailed instructions, submission format..."
              required
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        title={`Submissions: ${selectedAssignment?.title}`}
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto divide-y divide-[#E3E1D6] border border-[#E3E1D6] rounded-xl">
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <div key={sub.id} className="p-3.5 space-y-2 hover:bg-[#F8F7F2] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#242820] text-xs">{sub.studentName} (Roll: {sub.studentRoll})</p>
                      <p className="text-[11px] text-[#74796D]">{new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={sub.status === 'GRADED' ? 'olive' : 'gold'}>{sub.status}</Badge>
                  </div>
                  <p className="text-xs text-[#555B50] bg-white p-2 rounded-lg border border-[#E3E1D6]">
                    {sub.submissionText || 'Work submitted via portal attachment.'}
                  </p>
                  {sub.status === 'GRADED' ? (
                    <div className="text-xs text-[#52613B] font-bold">
                      Grade Awarded: {sub.obtainedMarks} / {selectedAssignment?.maxMarks} ({sub.feedback})
                    </div>
                  ) : gradingSub === sub.id ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Marks"
                          value={gradeMarks}
                          onChange={(e) => setGradeMarks(e.target.value)}
                          className="input-field w-24 text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Feedback comment..."
                          value={gradeFeedback}
                          onChange={(e) => setGradeFeedback(e.target.value)}
                          className="input-field flex-1 text-xs font-semibold"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setGradingSub(null)}
                          className="btn-secondary text-[11px] font-bold py-1 px-2.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleGrade(sub.id)}
                          className="btn-primary text-[11px] font-bold py-1 px-3"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setGradingSub(sub.id);
                        setGradeMarks('');
                        setGradeFeedback('');
                      }}
                      className="btn-secondary text-[11px] font-bold py-1 px-3 text-[#52613B]"
                    >
                      Grade This Work
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-[#74796D] font-medium">No student submissions submitted yet.</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSubmissionsModal(false)}
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

export default TeacherAssignmentsPage;
