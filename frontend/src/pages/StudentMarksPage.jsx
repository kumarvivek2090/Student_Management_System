import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Award, BookOpen, Download, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const StudentMarksPage = () => {
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'marks'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data?.data;
    }
  });

  const handleDownloadPdf = async () => {
    if (!data?.studentId) return;
    setDownloading(true);
    try {
      const yId = data.academicYearId || '';
      const sId = data.semesterId || '';
      const response = await api.get(
        `/reports/student/${data.studentId}/pdf?academicYearId=${yId}&semesterId=${sId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Academic_Report_${data.studentCode || 'Student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official academic report card downloaded!');
    } catch (e) {
      toast.error('Failed to download report PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Academic Evaluation
            </span>
            <span className="text-xs text-[#555B50] font-semibold">{data?.academicYearName} • {data?.semesterName}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">My Academic Marks & Grade Standing</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Verified course examination results and grade breakdown recorded in Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Compiling PDF...' : 'Download Official PDF Report'}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${data?.overallPercentage || 0}%`}
          icon={Award}
          trend={(data?.overallPercentage || 0) >= 70 ? 'up' : 'neutral'}
          change="Cumulative score"
        />
        <StatCard
          title="Current Grade"
          value={data?.currentGrade || 'N/A'}
          icon={BookOpen}
          subtitle="Evaluation scale rating"
        />
        <StatCard
          title="Enrolled Subjects"
          value={data?.totalSubjects || 0}
          icon={Layers}
          subtitle="Official curriculum count"
        />
        <StatCard
          title="Academic Standing"
          value={(data?.overallPercentage || 0) >= 75 ? 'First Class' : 'Standard Pass'}
          icon={TrendingUp}
          trend="up"
          change="In good academic standing"
        />
      </div>

      {/* Subject Marks Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-[#F0EFE6]/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#242820]">Subject Marks & Grading Scale Breakdown</h3>
            <p className="text-[11px] text-[#555B50] font-medium">Evaluation marks entered by certified department faculty</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded border border-[#CAD6B7]">
            Official Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Curriculum Course</th>
                <th className="px-4 py-3.5">Course Code</th>
                <th className="px-4 py-3.5 text-center">Max Points</th>
                <th className="px-4 py-3.5 text-center">Marks Scored</th>
                <th className="px-4 py-3.5 text-center">Percentage</th>
                <th className="px-4 py-3.5 text-center">Grade</th>
                <th className="px-4 py-3.5 text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {data?.subjects?.length > 0 ? (
                data.subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#242820]">{sub.subjectName}</td>
                    <td className="px-4 py-3.5 text-[#555B50] font-mono font-semibold">{sub.subjectCode}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#555B50]">{sub.maxMarks}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#242820]">{sub.obtainedMarks}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#52613B]">{sub.percentage}%</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="olive">{sub.grade}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Satisfied
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No examination marks entered yet for this term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksPage;
