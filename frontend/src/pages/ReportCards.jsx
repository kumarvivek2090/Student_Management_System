import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Download, Printer, Award, FileText, CheckCircle2, GraduationCap, User, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportCards = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const isParent = user?.role === 'PARENT';
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  // Master lists
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Parent specific children list
  const [parentChildren, setParentChildren] = useState([]);

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
  }, [user?.role]);

  const fetchInitialSetup = async () => {
    try {
      const yRes = await api.get('/academic-years');
      let currentYearId = '';
      let currentSemId = '';

      if (yRes.data?.success && yRes.data.data.length > 0) {
        setAcademicYears(yRes.data.data);
        const currentYear = yRes.data.data[0];
        currentYearId = currentYear.id;
        setSelectedYear(currentYearId);

        const sRes = await api.get(`/academic-years/${currentYear.id}/semesters`);
        if (sRes.data?.success && sRes.data.data.length > 0) {
          setSemesters(sRes.data.data);
          currentSemId = sRes.data.data[0].id;
          setSelectedSemester(currentSemId);
        }
      }

      // 1. Role = STUDENT: Load only their own report card directly
      if (isStudent) {
        fetchStudentReport(currentYearId, currentSemId);
        return;
      }

      // 2. Role = PARENT: Load only officially linked children
      if (isParent) {
        const pRes = await api.get('/students');
        const children = pRes.data?.data || [];
        setParentChildren(children);
        if (children.length > 0) {
          setSelectedStudent(children[0].id);
          fetchReportCard(children[0].id, currentYearId, currentSemId);
        }
        return;
      }

      // 3. Role = ADMIN or TEACHER: Load classes (backend isolates teacher classes)
      const cRes = await api.get('/classes');
      if (cRes.data?.success) {
        setClasses(cRes.data.data);
      }
    } catch (e) {
      console.error('Failed to initialize report card setup', e);
    }
  };

  // For Student: Fetch authenticated student report without needing external ID
  const fetchStudentReport = async (yearId, semId) => {
    setLoading(true);
    try {
      const params = {};
      if (yearId) params.academicYearId = yearId;
      if (semId) params.semesterId = semId;

      const res = await api.get('/reports/my-report', { params });
      if (res.data?.success) {
        setReport(res.data.data);
        if (res.data.data.studentId) {
          setSelectedStudent(res.data.data.studentId);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not load official academic report card');
    } finally {
      setLoading(false);
    }
  };

  // For Admin / Teacher / Parent: Fetch report for an authorized student ID
  const fetchReportCard = async (studentId, yearId, semId) => {
    if (!studentId || !yearId || !semId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/student/${studentId}`, {
        params: { academicYearId: yearId, semesterId: semId },
      });
      if (res.data?.success) {
        setReport(res.data.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate report card');
    } finally {
      setLoading(false);
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
      if (res.data?.success) setSections(res.data.data);
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
      if (res.data?.success) {
        setStudents(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStudent(res.data.data[0].id);
          fetchReportCard(res.data.data[0].id, selectedYear, selectedSemester);
        }
      }
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      let res;
      if (isStudent) {
        res = await api.get('/reports/my-report/pdf', {
          params: { academicYearId: selectedYear, semesterId: selectedSemester },
          responseType: 'blob',
        });
      } else {
        if (!selectedStudent || !selectedYear || !selectedSemester) return;
        res = await api.get(`/reports/student/${selectedStudent}/pdf`, {
          params: { academicYearId: selectedYear, semesterId: selectedSemester },
          responseType: 'blob',
        });
      }

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
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold text-[#52613B] dark:text-[#BCE39C] bg-[#E4EAD9] dark:bg-[#23311E] px-2.5 py-0.5 rounded-full border border-[#CAD6B7] dark:border-[#384E2F]">
              {isStudent ? 'Official Transcript' : isParent ? 'Guardian Academic View' : 'Institutional Reporting'}
            </span>
            <span className="text-xs text-[#555B50] dark:text-[#CAD6B7]">
              {report?.academicYearName || 'Academic Year 2026-2027'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal dark:text-white">
            {isStudent ? 'My Academic Report Card' : isParent ? 'Child Academic Progress Report' : 'Report Card Generator'}
          </h2>
          <p className="text-xs text-muted dark:text-[#CAD6B7]">
            {isStudent
              ? 'Official authenticated academic record, term examination marks, GPA standing, and faculty remarks.'
              : 'Compile real-time examination results, subject grades, and attendance metrics into downloadable reports.'}
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

      {/* 1. STUDENT IDENTITY BANNER - NO STUDENT DROPDOWN */}
      {isStudent && (
        <div className="card-premium p-6 bg-gradient-to-r from-cream/80 to-white dark:from-[#1A2417] dark:to-[#182216] border border-[#E3E1D6] dark:border-[#283623] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#52613B] text-white flex items-center justify-center font-bold text-xl shadow-md border border-[#7B8F5E]">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-[#52613B] dark:text-[#BCE39C] bg-[#E4EAD9] dark:bg-[#23311E] px-2.5 py-0.5 rounded-full border border-[#CAD6B7] dark:border-[#384E2F]">
                  {report?.className ? `${report.className} - Section ${report.sectionName}` : 'Enrolled Student'}
                </span>
                <span className="text-xs text-[#555B50] dark:text-[#CAD6B7] font-semibold">
                  Roll No: {report?.rollNumber || '—'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#242820] dark:text-white mt-1">
                {report?.studentFullName || user?.fullName}
              </h2>
              <p className="text-xs text-[#555B50] dark:text-[#B5BFAB]">
                Student ID: <span className="font-mono font-semibold text-charcoal dark:text-white">{report?.studentCode || '—'}</span> | Term: {report?.academicYearName || 'Current Year'} ({report?.semesterName || 'Current Semester'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div>
              <label className="block text-[11px] font-bold text-[#555B50] dark:text-[#CAD6B7] mb-1">
                Select Academic Term
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  fetchStudentReport(selectedYear, e.target.value);
                }}
                className="bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-[#242820] dark:text-white shadow-xs outline-none focus:border-[#52613B]"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. PARENT VIEW: SELECT FROM LINKED CHILDREN ONLY */}
      {isParent && (
        <div className="card-premium p-5 bg-[#F8F7F2] dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5 uppercase tracking-wider">
                Select Registered Child
              </label>
              <div className="flex flex-wrap gap-2">
                {parentChildren.length > 0 ? (
                  parentChildren.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(ch.id);
                        fetchReportCard(ch.id, selectedYear, selectedSemester);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                        selectedStudent === ch.id
                          ? 'bg-[#52613B] text-white shadow-sm'
                          : 'bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] text-charcoal dark:text-white hover:bg-cream/40'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{ch.fullName} ({ch.studentId})</span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-muted">No children officially linked to your guardian account.</span>
                )}
              </div>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-bold text-[#242820] dark:text-[#E8EDE4] mb-1.5 uppercase tracking-wider">
                Semester Term
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  fetchReportCard(selectedStudent, selectedYear, e.target.value);
                }}
                className="w-full bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] rounded-xl px-3 py-2 text-xs font-semibold text-charcoal dark:text-white outline-none focus:border-[#52613B]"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADMIN & TEACHER FILTER CONTROLS */}
      {(isAdmin || isTeacher) && (
        <div className="card-premium p-6 bg-cream/30 dark:bg-[#131A12] border border-[#E3E1D6] dark:border-[#283623]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="input-field text-xs py-2 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] text-charcoal dark:text-white"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                disabled={!selectedClass}
                className="input-field text-xs py-2 disabled:bg-cream/70 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] text-charcoal dark:text-white"
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1">
                {isTeacher ? 'Assigned Student' : 'Scholar'}
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  fetchReportCard(e.target.value, selectedYear, selectedSemester);
                }}
                disabled={students.length === 0}
                className="input-field text-xs py-2 disabled:bg-cream/70 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] text-charcoal dark:text-white"
              >
                <option value="">Select Student</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.fullName} (Roll: {st.rollNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  fetchReportCard(selectedStudent, selectedYear, e.target.value);
                }}
                className="input-field text-xs py-2 bg-white dark:bg-[#182216] border border-[#E3E1D6] dark:border-[#2D3D27] text-charcoal dark:text-white"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Document Preview */}
      {loading ? (
        <LoadingSpinner message="Calculating cumulative results from Neon PostgreSQL..." />
      ) : report ? (
        <div className="card-premium p-8 bg-white dark:bg-[#182216] border border-warmgrey dark:border-[#283623] shadow-elevated max-w-4xl mx-auto space-y-6">
          {/* Institutional Header */}
          <div className="text-center border-b border-warmgrey/70 dark:border-[#283623] pb-6">
            <div className="w-12 h-12 rounded-xl bg-[#52613B] text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#243629] dark:text-[#E8EDE4] uppercase">
              {report.institutionName}
            </h1>
            <p className="text-xs text-muted dark:text-[#CAD6B7]">{report.institutionAddress} | Official Academic Progress Report</p>
            <p className="text-xs font-semibold text-[#52613B] dark:text-[#BCE39C] mt-1">
              {report.academicYearName} — {report.semesterName}
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-cream/40 dark:bg-[#131A12] border border-warmgrey dark:border-[#283623] text-xs">
            <div>
              <span className="text-muted dark:text-[#CAD6B7] block">Student Name:</span>
              <strong className="text-charcoal dark:text-white font-semibold">{report.studentFullName}</strong>
            </div>
            <div>
              <span className="text-muted dark:text-[#CAD6B7] block">Student ID:</span>
              <strong className="text-charcoal dark:text-white font-semibold">{report.studentCode}</strong>
            </div>
            <div>
              <span className="text-muted dark:text-[#CAD6B7] block">Class & Section:</span>
              <strong className="text-charcoal dark:text-white font-semibold">{report.className} - {report.sectionName}</strong>
            </div>
            <div>
              <span className="text-muted dark:text-[#CAD6B7] block">Roll Number:</span>
              <strong className="text-charcoal dark:text-white font-semibold">{report.rollNumber}</strong>
            </div>
          </div>

          {/* Academic Results Table */}
          <div>
            <h3 className="text-xs font-bold text-[#243629] dark:text-[#BCE39C] uppercase tracking-wider mb-3">Academic Performance</h3>
            <div className="overflow-x-auto border border-warmgrey dark:border-[#283623] rounded-xl">
              <table className="min-w-full divide-y divide-warmgrey dark:divide-[#283623] text-xs text-left">
                <thead className="bg-[#243629] dark:bg-[#131A12] text-white font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Marks Obtained</th>
                    <th className="px-4 py-3 text-center">Percentage</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgrey/60 dark:divide-[#283623] text-[#242820] dark:text-[#E8EDE4]">
                  {report.subjects?.map((sub, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-cream/20 dark:bg-[#1D281A]' : 'bg-white dark:bg-[#182216]'}>
                      <td className="px-4 py-3 font-semibold text-charcoal dark:text-white">
                        {sub.subjectName} <span className="text-muted dark:text-[#CAD6B7] text-[10px]">({sub.subjectCode})</span>
                      </td>
                      <td className="px-4 py-3 text-center text-charcoal dark:text-white">{sub.maxMarks}</td>
                      <td className="px-4 py-3 text-center font-bold text-charcoal dark:text-white">{sub.obtainedMarks}</td>
                      <td className="px-4 py-3 text-center font-semibold text-[#52613B] dark:text-[#BCE39C]">{sub.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="olive">{sub.grade}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-700 dark:text-emerald-400 font-semibold">{sub.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cumulative Result Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-olive-50 dark:bg-[#212C1D] border border-olive-200 dark:border-[#344A38] text-center">
            <div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7] uppercase font-semibold">Total Max Marks</p>
              <p className="text-base font-bold text-charcoal dark:text-white mt-0.5">{report.totalMaxMarks}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7] uppercase font-semibold">Marks Obtained</p>
              <p className="text-base font-bold text-charcoal dark:text-white mt-0.5">{report.totalObtainedMarks}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7] uppercase font-semibold">Overall Percentage</p>
              <p className="text-base font-bold text-[#52613B] dark:text-[#BCE39C] mt-0.5">{report.percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7] uppercase font-semibold">Final Grade</p>
              <p className="text-base font-bold text-[#52613B] dark:text-[#BCE39C] mt-0.5">{report.overallGrade}</p>
            </div>
          </div>

          {/* Teacher Remarks */}
          {report.teacherRemarks?.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-[#243629] dark:text-[#BCE39C] uppercase tracking-wider mb-2">Faculty Observations</h3>
              <div className="space-y-2">
                {report.teacherRemarks.map((rem, i) => (
                  <div key={i} className="p-3 rounded-lg bg-cream/30 dark:bg-[#1D281A] border border-warmgrey dark:border-[#283623] text-xs">
                    <span className="font-semibold text-charcoal dark:text-white">[{rem.category} - {rem.teacherFullName}]: </span>
                    <span className="text-muted dark:text-[#CAD6B7]">{rem.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Blocks */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-warmgrey/70 dark:border-[#283623]">
            <div>
              <div className="w-48 mx-auto border-b border-charcoal/40 dark:border-[#CAD6B7]/40 pb-1 mb-1 font-semibold text-charcoal dark:text-white">
                Class Coordinator
              </div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7]">Academic Mentor Signature</p>
            </div>
            <div>
              <div className="w-48 mx-auto border-b border-charcoal/40 dark:border-[#CAD6B7]/40 pb-1 mb-1 font-semibold text-charcoal dark:text-white">
                Office of the Principal
              </div>
              <p className="text-[10px] text-muted dark:text-[#CAD6B7]">Institutional Seal & Authority</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-12 text-center text-xs text-muted dark:text-[#CAD6B7]">
          {isStudent
            ? 'Generating your official academic report card...'
            : isParent
            ? 'Select a child above to view their academic report card.'
            : 'Select class, section, and student above to generate the live academic report card.'}
        </div>
      )}
    </div>
  );
};

export default ReportCards;
