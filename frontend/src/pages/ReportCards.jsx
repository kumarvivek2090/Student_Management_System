import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Download, Printer, Award, FileText, CheckCircle2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportCards = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInitialSetup();
  }, []);

  const fetchInitialSetup = async () => {
    try {
      const [cRes, yRes] = await Promise.all([api.get('/classes'), api.get('/academic-years')]);
      if (cRes.data.success) setClasses(cRes.data.data);
      if (yRes.data.success && yRes.data.data.length > 0) {
        setAcademicYears(yRes.data.data);
        const currentYear = yRes.data.data[0];
        setSelectedYear(currentYear.id);
        const sRes = await api.get(`/academic-years/${currentYear.id}/semesters`);
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSemesters(sRes.data.data);
          setSelectedSemester(sRes.data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setSelectedStudent('');
    setStudents([]);
    setReport(null);
    if (classId) {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) setSections(res.data.data);
    }
  };

  const handleSectionChange = async (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedStudent('');
    setReport(null);
    if (selectedClass && sectionId) {
      const res = await api.get('/students', {
        params: { classId: selectedClass, sectionId },
      });
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStudent(res.data.data[0].id);
          fetchReportCard(res.data.data[0].id, selectedYear, selectedSemester);
        }
      }
    }
  };

  const fetchReportCard = async (studentId, yearId, semId) => {
    if (!studentId || !yearId || !semId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/student/${studentId}`, {
        params: { academicYearId: yearId, semesterId: semId },
      });
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to generate report card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedStudent || !selectedYear || !selectedSemester) return;
    setDownloading(true);
    try {
      const res = await api.get(`/reports/student/${selectedStudent}/pdf`, {
        params: { academicYearId: selectedYear, semesterId: selectedSemester },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Academic_Report_${report?.studentCode || 'student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official academic report card PDF generated and downloaded!');
    } catch (e) {
      toast.error('Error downloading report PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Report Card Generator</h2>
          <p className="text-xs text-muted">
            Compile real-time examination results, subject grades, and attendance metrics into downloadable reports
          </p>
        </div>
        {report && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Compiling PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Selectors Card */}
      <div className="card-premium p-6 bg-cream/30">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="input-field text-xs py-2"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClass}
              className="input-field text-xs py-2 disabled:bg-cream/70"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Scholar</label>
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                fetchReportCard(e.target.value, selectedYear, selectedSemester);
              }}
              disabled={students.length === 0}
              className="input-field text-xs py-2 disabled:bg-cream/70"
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>{st.fullName} (Roll: {st.rollNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                fetchReportCard(selectedStudent, selectedYear, e.target.value);
              }}
              className="input-field text-xs py-2"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Card Document Preview */}
      {loading ? (
        <LoadingSpinner message="Calculating cumulative results from Neon PostgreSQL..." />
      ) : report ? (
        <div className="card-premium p-8 bg-white border border-warmgrey shadow-elevated max-w-4xl mx-auto space-y-6">
          {/* Institutional Header */}
          <div className="text-center border-b border-warmgrey/70 pb-6">
            <div className="w-12 h-12 rounded-xl bg-olive-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-olive-900 uppercase">
              {report.institutionName}
            </h1>
            <p className="text-xs text-muted">{report.institutionAddress} | Official Academic Progress Report</p>
            <p className="text-xs font-semibold text-olive-700 mt-1">
              {report.academicYearName} — {report.semesterName}
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-cream/40 border border-warmgrey text-xs">
            <div>
              <span className="text-muted block">Student Name:</span>
              <strong className="text-charcoal font-semibold">{report.studentFullName}</strong>
            </div>
            <div>
              <span className="text-muted block">Student ID:</span>
              <strong className="text-charcoal font-semibold">{report.studentCode}</strong>
            </div>
            <div>
              <span className="text-muted block">Class & Section:</span>
              <strong className="text-charcoal font-semibold">{report.className} - {report.sectionName}</strong>
            </div>
            <div>
              <span className="text-muted block">Roll Number:</span>
              <strong className="text-charcoal font-semibold">{report.rollNumber}</strong>
            </div>
          </div>

          {/* Academic Results Table */}
          <div>
            <h3 className="text-xs font-bold text-olive-800 uppercase tracking-wider mb-3">Academic Performance</h3>
            <div className="overflow-x-auto border border-warmgrey rounded-xl">
              <table className="min-w-full divide-y divide-warmgrey text-xs text-left">
                <thead className="bg-olive-800 text-white font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Marks Obtained</th>
                    <th className="px-4 py-3 text-center">Percentage</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgrey/60">
                  {report.subjects?.map((sub, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-cream/20' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-charcoal">
                        {sub.subjectName} <span className="text-muted text-[10px]">({sub.subjectCode})</span>
                      </td>
                      <td className="px-4 py-3 text-center text-charcoal">{sub.maxMarks}</td>
                      <td className="px-4 py-3 text-center font-bold text-charcoal">{sub.obtainedMarks}</td>
                      <td className="px-4 py-3 text-center font-semibold text-olive-700">{sub.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="olive">{sub.grade}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-700 font-semibold">{sub.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cumulative Result Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-olive-50 border border-olive-200 text-center">
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Total Max Marks</p>
              <p className="text-base font-bold text-charcoal mt-0.5">{report.totalMaxMarks}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Marks Obtained</p>
              <p className="text-base font-bold text-charcoal mt-0.5">{report.totalObtainedMarks}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Overall Percentage</p>
              <p className="text-base font-bold text-olive-800 mt-0.5">{report.percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Final Grade</p>
              <p className="text-base font-bold text-olive-800 mt-0.5">{report.overallGrade}</p>
            </div>
          </div>

          {/* Teacher Remarks */}
          {report.teacherRemarks?.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-olive-800 uppercase tracking-wider mb-2">Faculty Observations</h3>
              <div className="space-y-2">
                {report.teacherRemarks.map((rem, i) => (
                  <div key={i} className="p-3 rounded-lg bg-cream/30 border border-warmgrey text-xs">
                    <span className="font-semibold text-charcoal">[{rem.category} - {rem.teacherFullName}]: </span>
                    <span className="text-muted">{rem.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Blocks */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-warmgrey/70">
            <div>
              <div className="w-48 mx-auto border-b border-charcoal/40 pb-1 mb-1 font-semibold text-charcoal">
                Class Coordinator
              </div>
              <p className="text-[10px] text-muted">Academic Mentor Signature</p>
            </div>
            <div>
              <div className="w-48 mx-auto border-b border-charcoal/40 pb-1 mb-1 font-semibold text-charcoal">
                Office of the Principal
              </div>
              <p className="text-[10px] text-muted">Institutional Seal & Authority</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-12 text-center text-xs text-muted">
          Select class, section, and student above to generate the live academic report card.
        </div>
      )}
    </div>
  );
};

export default ReportCards;
