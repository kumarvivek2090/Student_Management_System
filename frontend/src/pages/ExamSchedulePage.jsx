import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Award, Clock, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';

const ExamSchedulePage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examinations');
      if (res.data?.success) {
        setExams(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load examination timetable');
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
              Examination Board
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Fall 2026 Term</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Institutional Examination Schedule</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Official term examination dates, assessment guidelines, time windows, and examination center guidelines.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length > 0 ? (
          exams.map((ex) => (
            <div
              key={ex.id}
              className="card-premium p-5 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant={ex.status === 'COMPLETED' ? 'olive' : 'gold'}>{ex.status}</Badge>
                  <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded border border-[#CAD6B7]">
                    {ex.examType}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#242820] leading-snug">{ex.name}</h3>
                  <p className="text-xs text-[#555B50] mt-1 leading-relaxed">{ex.description || 'Comprehensive term assessment.'}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E3E1D6] text-xs text-[#555B50] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Start Date:</span>
                    <strong className="text-[#242820]">{ex.startDate || '2026-10-12'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">End Date:</span>
                    <strong className="text-[#242820]">{ex.endDate || '2026-10-20'}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#E3E1D6]">
                    <span className="font-semibold">Session Term:</span>
                    <strong className="text-[#52613B]">{ex.academicYearName}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EFE6] text-center text-xs font-bold text-[#52613B] bg-[#E4EAD9]/40 py-2 rounded-lg border border-[#CAD6B7]">
                Official Hall Pass Validated
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No examination schedules published yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSchedulePage;
