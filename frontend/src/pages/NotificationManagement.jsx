import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bell, Send, Users, AlertCircle, CheckCircle, Info, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'ALL',
    type: 'INFO'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error('Title and message are required');
      return;
    }
    try {
      const res = await api.post('/notifications/broadcast', form);
      if (res.data?.success) {
        toast.success(`Broadcast sent to ${res.data.data?.recipients || 'target'} users!`);
        setForm({
          title: '',
          message: '',
          targetRole: 'ALL',
          type: 'INFO'
        });
        loadNotifications();
      }
    } catch (e) {
      toast.error('Failed to broadcast announcement');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Communications Engine
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Institutional Announcements</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Notifications & Announcements Center</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Broadcast official academy circulars, term alerts, examination notices, and direct emergency messages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose Broadcast (1 Col) */}
        <div className="card-premium p-6 border border-[#E3E1D6] space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E1D6]">
            <Send className="w-4 h-4 text-[#52613B]" />
            <h3 className="text-sm font-bold text-[#242820]">Compose Official Broadcast</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Target Audience</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="ALL">ALL INSTITUTION (Everyone)</option>
                <option value="STUDENT">STUDENTS ONLY</option>
                <option value="TEACHER">FACULTY & TEACHERS</option>
                <option value="PARENT">PARENTS & GUARDIANS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Alert Priority Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="INFO">INFORMATIONAL (Standard Notice)</option>
                <option value="ALERT">URGENT ALERT (Priority Notice)</option>
                <option value="SUCCESS">ACADEMIC COMMENDATION</option>
                <option value="WARNING">DEADLINE / COMPLIANCE WARNING</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Announcement Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="e.g. Schedule for Midterm Examination Fall 2026"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Circular Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="Compose announcement body, venue, prerequisites..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-xs font-bold py-2.5 flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Immediately</span>
            </button>
          </form>
        </div>

        {/* Right: Broadcast Log (2 Cols) */}
        <div className="lg:col-span-2 card-premium overflow-hidden border border-[#E3E1D6]">
          <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#242820]">Institutional Notification Stream</h3>
              <p className="text-[11px] text-[#555B50] font-medium">Recent transmissions logged across system</p>
            </div>
            <span className="text-xs text-[#52613B] font-bold">Total: {notifications.length}</span>
          </div>

          <div className="divide-y divide-[#E3E1D6] p-2 max-h-[500px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-[#F8F7F2] transition-colors rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#242820]">{n.title}</span>
                    <Badge variant={n.type === 'ALERT' ? 'error' : n.type === 'WARNING' ? 'gold' : 'olive'}>
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#555B50] leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-[#74796D] font-mono">
                    Status: {n.isRead ? 'Acknowledged' : 'Delivered'}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-xs text-[#74796D] font-medium">No circulars posted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
