import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Award, CheckCircle2, Save, Filter, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MarksEntry = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // Selection
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');

  // Assessment details & students marks list
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSetup();
  }, []);

  const loadSetup = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get('/classes'),
        api.get('/examinations'),
      ]);
      if (cRes.data.success) setClasses(cRes.data.data);
      if (eRes.data.success) setExaminations(eRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setSelectedAssessment('');
    setCurrentAssessment(null);
    setStudentMarks([]);

    if (classId) {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) setSections(res.data.data);
    } else {
      setSections([]);
    }
  };

  const handleSectionChange = async (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedAssessment('');
    setCurrentAssessment(null);
    setStudentMarks([]);

    if (selectedClass && sectionId) {
      const res = await api.get(`/assessments/class/${selectedClass}/section/${sectionId}`);
      if (res.data.success) setAssessments(res.data.data);
    }
  };

  const handleAssessmentChange = async (assessmentId) => {
    setSelectedAssessment(assessmentId);
    if (!assessmentId) {
      setCurrentAssessment(null);
      setStudentMarks([]);
      return;
    }

    setLoading(true);
    try {
      const aObj = assessments.find((a) => a.id === assessmentId);
      setCurrentAssessment(aObj);

      // Fetch enrolled students for class and section
      const sRes = await api.get('/students', {
        params: { classId: selectedClass, sectionId: selectedSection },
      });

      // Fetch existing marks for this assessment
      const mRes = await api.get(`/marks/assessment/${assessmentId}`);
      const existingMarksMap = new Map();
      if (mRes.data.success) {
        mRes.data.data.forEach((m) => existingMarksMap.set(m.studentId, m));
      }

      const rows = sRes.data.data.map((st) => {
        const em = existingMarksMap.get(st.id);
        return {
          studentId: st.id,
          fullName: st.fullName,
          studentCode: st.studentId,
          rollNumber: st.rollNumber,
          obtainedMarks: em ? em.obtainedMarks : '',
          isAbsent: em ? em.isAbsent : false,
          remarks: em ? em.remarks || '' : '',
          grade: em ? em.grade : '—',
        };
      });

      setStudentMarks(rows);
    } catch (e) {
      toast.error('Failed to load assessment roster');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (index, val) => {
    const updated = [...studentMarks];
    updated[index].obtainedMarks = val;
    setStudentMarks(updated);
  };

  const handleAbsentChange = (index, isAbsent) => {
    const updated = [...studentMarks];
    updated[index].isAbsent = isAbsent;
    if (isAbsent) {
      updated[index].obtainedMarks = 0;
    }
    setStudentMarks(updated);
  };

  const handleRemarkChange = (index, remarks) => {
    const updated = [...studentMarks];
    updated[index].remarks = remarks;
    setStudentMarks(updated);
  };

  const handleSaveMarks = async () => {
    if (!currentAssessment) return;

    // Validate marks
    for (const sm of studentMarks) {
      if (!sm.isAbsent) {
        if (sm.obtainedMarks === '' || sm.obtainedMarks === null) {
          toast.error(`Please enter marks for ${sm.fullName} or check Absent.`);
          return;
        }
        const num = parseFloat(sm.obtainedMarks);
        if (isNaN(num) || num < 0) {
          toast.error(`Invalid negative mark for ${sm.fullName}`);
          return;
        }
        if (num > currentAssessment.maxMarks) {
          toast.error(
            `Mark for ${sm.fullName} (${num}) exceeds assessment max (${currentAssessment.maxMarks})`
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        assessmentId: currentAssessment.id,
        marks: studentMarks.map((s) => ({
          studentId: s.studentId,
          obtainedMarks: s.isAbsent ? 0 : parseFloat(s.obtainedMarks),
          isAbsent: s.isAbsent,
          remarks: s.remarks,
        })),
      };

      const res = await api.post('/marks/bulk', payload);
      if (res.data.success) {
        toast.success('Assessment marks persisted to Neon PostgreSQL successfully!');
        // Refresh with calculated grades from backend response
        const resultMap = new Map(res.data.data.map((m) => [m.studentId, m]));
        setStudentMarks((prev) =>
          prev.map((p) => {
            const m = resultMap.get(p.studentId);
            return m ? { ...p, grade: m.grade } : p;
          })
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Assessment Marks Entry</h2>
          <p className="text-xs text-muted">
            Direct database entry with live percentage calculation, grading scale resolution, and validation
          </p>
        </div>
      </div>

      {/* Selectors Card */}
      <div className="card-premium p-6 bg-cream/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="block text-xs font-semibold text-charcoal mb-1">Assessment Target</label>
            <select
              value={selectedAssessment}
              onChange={(e) => handleAssessmentChange(e.target.value)}
              disabled={!selectedSection || assessments.length === 0}
              className="input-field text-xs py-2 disabled:bg-cream/70"
            >
              <option value="">Select Assessment</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.subjectName} - Max: {a.maxMarks})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentAssessment && (
          <div className="mt-4 pt-4 border-t border-warmgrey/70 flex flex-wrap items-center justify-between text-xs text-muted gap-2">
            <div>
              Subject: <strong className="text-charcoal">{currentAssessment.subjectName}</strong> ({currentAssessment.subjectCode}) |
              Max Marks: <strong className="text-olive-700">{currentAssessment.maxMarks}</strong> |
              Passing: <strong className="text-charcoal">{currentAssessment.passingMarks}</strong>
            </div>
            <Badge variant="olive">Direct Neon PostgreSQL Persistence</Badge>
          </div>
        )}
      </div>

      {/* Marks Table */}
      {loading ? (
        <LoadingSpinner message="Retrieving enrolled students from Neon..." />
      ) : currentAssessment && studentMarks.length > 0 ? (
        <div className="card-premium overflow-hidden">
          <div className="p-4 border-b border-warmgrey/70 bg-cream/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal">
              Student Assessment Roster ({studentMarks.length} Scholars)
            </h3>
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving to Neon...' : 'Save All Marks'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-warmgrey/60 text-left text-xs">
              <thead className="bg-cream/60 text-muted font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3 text-center">Absent?</th>
                  <th className="px-4 py-3">Obtained Marks (/ {currentAssessment.maxMarks})</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3">Remarks / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgrey/40 bg-white">
                {studentMarks.map((st, idx) => (
                  <tr key={st.studentId} className="hover:bg-ivory/50">
                    <td className="px-4 py-3 font-semibold text-charcoal">{st.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{st.fullName}</td>
                    <td className="px-4 py-3 text-muted">{st.studentCode}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={st.isAbsent}
                        onChange={(e) => handleAbsentChange(idx, e.target.checked)}
                        className="rounded border-warmgrey text-olive-600 focus:ring-olive-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max={currentAssessment.maxMarks}
                        step="0.5"
                        disabled={st.isAbsent}
                        value={st.obtainedMarks}
                        onChange={(e) => handleMarkChange(idx, e.target.value)}
                        placeholder="0.0"
                        className="w-28 input-field py-1 text-xs disabled:bg-cream/70"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={st.grade === 'F' ? 'danger' : 'olive'}>
                        {st.isAbsent ? 'AB' : st.grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={st.remarks}
                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                        placeholder="e.g. Good grasp of concepts"
                        className="w-full input-field py-1 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-cream/30 border-t border-warmgrey/60 flex items-center justify-between">
            <span className="text-xs text-muted">
              Note: Modifications directly update the relational database records in Neon.
            </span>
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving to Neon...' : 'Save All Marks'}</span>
            </button>
          </div>
        </div>
      ) : (
        selectedClass && selectedSection && (
          <div className="card-premium p-12 text-center text-xs text-muted">
            {assessments.length === 0
              ? 'No assessments found for this class and section. Please create an examination assessment first.'
              : 'Select an assessment above to load the student grading roster.'}
          </div>
        )
      )}
    </div>
  );
};

export default MarksEntry;
