import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { MessageSquare, Users, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';

const StudentRemarksPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'remarks'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data?.data?.remarks || [];
    }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Faculty Feedback
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Commendations & Academic Guidance</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Faculty Remarks & Pedagogical Notes</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Personalized academic appraisals, classroom participation feedback, and subject performance notes from your teachers.
          </p>
        </div>
      </div>

      {/* Remarks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.length > 0 ? (
          data.map((rem, idx) => (
            <div key={idx} className="card-premium p-6 border border-[#E3E1D6] space-y-3.5 hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#242820]">{rem.teacherName}</h3>
                  <p className="text-xs text-[#555B50] font-semibold">{rem.subjectName}</p>
                </div>
                <Badge variant="olive">{rem.category}</Badge>
              </div>

              <p className="text-xs text-[#242820] leading-relaxed bg-[#F8F7F2] p-4 rounded-xl border border-[#E3E1D6]">
                "{rem.description}"
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#74796D]">
                <span>Official Evaluation Term</span>
                <span className="font-semibold text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Published
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No teacher remarks published for this term yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRemarksPage;
