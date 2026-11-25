import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, Printer, Calendar, BookOpen, Layers, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const TeacherTimetablePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timetables/my-schedule');
      if (res.data?.success) {
        setSchedule(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load faculty instructional schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Faculty Schedule
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Weekly Teaching Periods: {schedule.length}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">My Teaching Timetable & Classroom Allocation</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Your weekly instructional lecture schedule, assigned classrooms, and active laboratory sessions.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-secondary text-xs font-bold flex items-center space-x-2 py-2.5 px-3.5"
        >
          <Printer className="w-3.5 h-3.5 text-[#52613B]" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* 5-Day Weekly Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const dayPeriods = schedule.filter((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="card-premium overflow-hidden border border-[#E3E1D6] flex flex-col">
              <div className="p-3 bg-[#1D251A] text-white flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{day}</span>
                <span className="text-[10px] bg-[#52613B] px-2 py-0.5 rounded-full font-semibold">
                  {dayPeriods.length} Classes
                </span>
              </div>

              <div className="p-3 flex-1 space-y-3 bg-[#F8F7F2]/60 min-h-[300px]">
                {dayPeriods.length > 0 ? (
                  dayPeriods.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3.5 bg-white rounded-xl border border-[#E3E1D6] shadow-sm hover:border-[#52613B] transition-all space-y-2"
                    >
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#52613B]">
                        <Clock className="w-3 h-3" />
                        <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#242820] leading-tight">{slot.subjectName}</p>
                        <p className="text-[11px] text-[#555B50] font-medium mt-0.5">
                          {slot.className} • Section {slot.sectionName}
                        </p>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-[10px] font-semibold text-[#74796D] border-t border-[#F0EFE6]">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#52613B]" />
                          <span>{slot.roomNumber}</span>
                        </span>
                        <span className="font-mono text-[#52613B] font-bold">{slot.subjectCode}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-center text-xs text-[#74796D] font-medium">
                    No lectures scheduled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherTimetablePage;
