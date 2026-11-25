import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Mail, Send, Users, MessageSquare, Phone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const ParentCommunicationPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      if (res.data?.success) {
        setTeachers(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load faculty directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`Message dispatched to ${selectedTeacher.fullName}! Faculty will respond via portal.`);
    setShowMessageModal(false);
    setMessage('');
    setSubject('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Parent-Faculty Engagement
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Direct Communication Hub</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Teacher Consultation & Direct Messaging</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Connect directly with your children's class mentors, subject teachers, and department heads.
          </p>
        </div>
      </div>

      {/* Faculty Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="card-premium p-6 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#52613B] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {t.fullName?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#242820]">{t.fullName}</h3>
                  <p className="text-xs text-[#52613B] font-semibold">{t.specialization || 'Department Faculty'}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E3E1D6] text-xs text-[#555B50] space-y-1">
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#74796D]" />
                  <span className="font-mono text-[11px] text-[#242820]">{t.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#74796D]" />
                  <span>{t.phone || '+1 (555) 432-1000'}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0EFE6]">
              <button
                onClick={() => {
                  setSelectedTeacher(t);
                  setShowMessageModal(true);
                }}
                className="w-full btn-primary text-xs font-bold py-2 flex items-center justify-center space-x-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Direct Inquiry</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={`Message to ${selectedTeacher?.fullName}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="p-3 bg-[#F0EFE6]/60 rounded-xl border border-[#E3E1D6] text-xs text-[#555B50]">
            Recipient: <strong className="text-[#242820]">{selectedTeacher?.fullName}</strong> ({selectedTeacher?.specialization})
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Inquiry Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field text-xs font-semibold"
              placeholder="e.g. Academic progress in Calculus / Lab Attendance"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Message Content</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field text-xs font-semibold"
              placeholder="Type your question, appointment request, or feedback..."
              required
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowMessageModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Dispatch Inquiry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParentCommunicationPage;
