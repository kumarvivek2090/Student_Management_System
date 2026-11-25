import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const LEAVE_TYPES = ['CASUAL', 'SICK', 'FAMILY', 'MEDICAL', 'ACADEMIC', 'OTHER'];

const LeaveRequestsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/leaves' : '/leaves/my-leaves';
      const res = await api.get(endpoint);
      if (res.data?.success) {
        setLeaves(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leaves/apply', form);
      if (res.data?.success) {
        toast.success('Leave application submitted!');
        setShowApplyModal(false);
        setForm({
          leaveType: 'CASUAL',
          startDate: '',
          endDate: '',
          reason: ''
        });
        loadLeaves();
      }
    } catch (e) {
      toast.error('Failed to file leave application');
    }
  };

  const handleReview = async (id, status) => {
    const remarks = prompt(`Enter review remarks for ${status.toLowerCase()}:`) || '';
    try {
      const res = await api.patch(`/leaves/${id}/status`, { status, remarks });
      if (res.data?.success) {
        toast.success(`Leave request ${status.toLowerCase()}`);
        loadLeaves();
      }
    } catch (e) {
      toast.error('Failed to update leave request');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Attendance & Leave Governance
            </span>
            <span className="text-xs text-[#555B50] font-semibold">{isAdmin ? 'All Institutional Applications' : 'My Leave Ledger'}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Leave Application & Approval Registry</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Submit leave of absence requests with medical/casual justifications, and track review status.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leaves Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#242820]">Application Records</h3>
          <span className="text-xs text-[#52613B] font-bold">Total: {leaves.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Applicant</th>
                <th className="px-4 py-3.5">Leave Type</th>
                <th className="px-4 py-3.5">Duration Window</th>
                <th className="px-4 py-3.5">Reason & Details</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {isAdmin && <th className="px-4 py-3.5 text-right">Review Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#242820]">{l.userFullName}</p>
                      <p className="text-[11px] text-[#555B50]">{l.userEmail} ({l.role})</p>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#52613B]">{l.leaveType}</td>
                    <td className="px-4 py-3.5 text-[#242820] font-medium whitespace-nowrap">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] max-w-sm">
                      <p>{l.reason}</p>
                      {l.reviewerRemarks && (
                        <p className="text-[11px] text-[#52613B] font-semibold mt-1">
                          Reviewer note: {l.reviewerRemarks}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={l.status === 'APPROVED' ? 'olive' : l.status === 'REJECTED' ? 'error' : 'gold'}>
                        {l.status}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {l.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleReview(l.id, 'APPROVED')}
                              className="btn-primary text-[11px] font-bold py-1 px-2.5"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(l.id, 'REJECTED')}
                              className="btn-secondary text-[11px] font-bold py-1 px-2.5 text-[#B84040]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Submit Leave of Absence Application"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Leave Classification</label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="input-field text-xs font-semibold"
            >
              {LEAVE_TYPES.map(t => (
                <option key={t} value={t}>{t} LEAVE</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Commencement Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Conclusion Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-field text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Justification & Reason</label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="State the circumstances for absence, medical notes, or academic event details..."
              required
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequestsPage;
