import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileCheck, Calendar, Clock, BookOpen, Send, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [form, setForm] = useState({
    submissionText: '',
    attachmentUrl: ''
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res.data?.success) {
        setAssignments(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load coursework assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submissionText) {
      toast.error('Please provide your solution or answer text');
      return;
    }
    try {
      const payload = {
        assignmentId: selectedAssignment.id,
        submissionText: form.submissionText,
        attachmentUrl: form.attachmentUrl
      };
      const res = await api.post('/assignments/submit', payload);
      if (res.data?.success) {
        toast.success('Assignment submitted to faculty!');
        setShowSubmitModal(false);
        setForm({ submissionText: '', attachmentUrl: '' });
        loadAssignments();
      }
    } catch (e) {
      toast.error('Submission failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Student Coursework
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Assigned Tasks: {assignments.length}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Assignments & Submissions</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Submit coursework solutions, track submission deadlines, and review faculty evaluations.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((a) => (
            <div
              key={a.id}
              className="card-premium p-5 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded border border-[#CAD6B7]">
                    {a.subjectCode} • {a.subjectName}
                  </span>
                  {a.isSubmittedByMe ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#242820] leading-snug">{a.title}</h3>
                  <p className="text-xs text-[#555B50] mt-1 line-clamp-3 leading-relaxed">{a.description}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6] text-xs text-[#555B50] space-y-1">
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <strong className="text-[#242820]">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Dec 01, 2026'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Points:</span>
                    <strong className="text-[#52613B]">{a.maxMarks} Pts</strong>
                  </div>
                  {a.myScore != null && (
                    <div className="flex justify-between pt-1 border-t border-[#E3E1D6] text-[#52613B] font-bold">
                      <span>Awarded Grade:</span>
                      <span>{a.myScore} / {a.maxMarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EFE6]">
                {a.isSubmittedByMe ? (
                  <div className="text-center py-2 text-xs font-bold text-[#52613B] bg-[#E4EAD9]/60 rounded-lg border border-[#CAD6B7]">
                    Work Recorded & Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAssignment(a);
                      setShowSubmitModal(true);
                    }}
                    className="w-full btn-primary text-xs font-bold py-2 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Assignment</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No pending coursework assignments.
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit: ${selectedAssignment?.title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#F0EFE6]/60 rounded-xl border border-[#E3E1D6] text-xs text-[#555B50] space-y-1">
            <p><strong>Course:</strong> {selectedAssignment?.subjectName} ({selectedAssignment?.subjectCode})</p>
            <p><strong>Instructions:</strong> {selectedAssignment?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Your Solution & Answers</label>
            <textarea
              rows={5}
              value={form.submissionText}
              onChange={(e) => setForm({ ...form, submissionText: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="Type your proofs, analysis, answers, or problem solutions here..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Document / Drive Link (Optional)</label>
            <input
              type="url"
              value={form.attachmentUrl}
              onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Confirm Submission
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentAssignmentsPage;
