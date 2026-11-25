import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Plus, MapPin, Clock, Trash2, Tag, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const EVENT_TYPES = ['ALL', 'ACADEMIC', 'EXAMINATION', 'HOLIDAY', 'MEETING', 'SPORTS', 'CULTURAL'];

const AcademicCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'ACADEMIC',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Oakridge Campus'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/calendar/events');
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load academic calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        startTime: form.startTime ? `${form.startTime}:00` : null,
        endTime: form.endTime ? `${form.endTime}:00` : null
      };
      const res = await api.post('/calendar/events', payload);
      if (res.data?.success) {
        toast.success('Calendar event published');
        setShowModal(false);
        loadEvents();
        setForm({
          title: '',
          description: '',
          eventType: 'ACADEMIC',
          startDate: '',
          endDate: '',
          startTime: '09:00',
          endTime: '12:00',
          location: 'Oakridge Campus'
        });
      }
    } catch (e) {
      toast.error('Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/calendar/events/${id}`);
      toast.success('Event deleted');
      loadEvents();
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  const filtered = filter === 'ALL' ? events : events.filter(e => e.eventType === filter);

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'EXAMINATION': return 'error';
      case 'HOLIDAY': return 'gold';
      case 'MEETING': return 'info';
      case 'CULTURAL': return 'sage';
      default: return 'olive';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Academic Planning
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Institutional Term 2026-2027</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Institutional Academic Calendar</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Key calendar milestones, term dates, examinations, institutional holidays, and parent-teacher consultations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish Event</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {EVENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              filter === t
                ? 'bg-[#52613B] text-white shadow-sm'
                : 'bg-white border border-[#E3E1D6] text-[#555B50] hover:bg-[#F0EFE6] hover:text-[#242820]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((ev) => (
            <div
              key={ev.id}
              className="card-premium p-5 border border-[#E3E1D6] flex flex-col justify-between hover:shadow-card transition-all relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={getBadgeVariant(ev.eventType)}>{ev.eventType}</Badge>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1 text-[#74796D] hover:text-[#B84040] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#242820] leading-snug">{ev.title}</h3>
                  <p className="text-xs text-[#555B50] mt-1.5 leading-relaxed">{ev.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0EFE6] space-y-2 text-xs text-[#555B50]">
                <div className="flex items-center space-x-2 font-semibold text-[#242820]">
                  <Calendar className="w-3.5 h-3.5 text-[#52613B]" />
                  <span>
                    {ev.startDate}
                    {ev.endDate && ev.endDate !== ev.startDate ? ` - ${ev.endDate}` : ''}
                  </span>
                </div>
                {ev.startTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#74796D]" />
                    <span>{ev.startTime?.slice(0, 5)} - {ev.endTime?.slice(0, 5)}</span>
                  </div>
                )}
                {ev.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#74796D]" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No events found for category: <strong>{filter}</strong>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule Academic Event"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="e.g. Midterm Examination Period"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Event Category</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                {EVENT_TYPES.filter(t => t !== 'ALL').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Campus Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="e.g. Main Auditorium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-field text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="input-field text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="input-field text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="Detailed guidelines, objectives, and circular notes..."
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicCalendarPage;
