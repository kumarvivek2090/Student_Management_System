import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { Plus, Award, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const ExaminationManagement = () => {
  const [examinations, setExaminations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({
    name: '',
    examType: 'MIDTERM',
    academicYearId: '',
    semesterId: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [assessmentForm, setAssessmentForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    name: '',
    maxMarks: 100,
    passingMarks: 40,
    assessmentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInitialSetup();
  }, []);

  const fetchInitialSetup = async () => {
    setLoading(true);
    try {
      const [eRes, cRes, sRes, yRes] = await Promise.all([
        api.get('/examinations'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/academic-years'),
      ]);
      if (eRes.data.success) setExaminations(eRes.data.data);
      if (cRes.data.success) setClasses(cRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
      if (yRes.data.success && yRes.data.data.length > 0) {
        setYears(yRes.data.data);
        const y0 = yRes.data.data[0];
        const semRes = await api.get(`/academic-years/${y0.id}/semesters`);
        if (semRes.data.success) setSemesters(semRes.data.data);
      }
    } catch (e) {
      toast.error('Failed to load examinations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddAssessment = async (exam) => {
    setSelectedExam(exam);
    const c0 = classes[0];
    setAssessmentForm({
      classId: c0?.id || '',
      sectionId: '',
      subjectId: subjects[0]?.id || '',
      name: `${exam.name} - Evaluation`,
      maxMarks: 100,
      passingMarks: 40,
      assessmentDate: new Date().toISOString().split('T')[0],
    });
    if (c0?.id) {
      const res = await api.get(`/classes/${c0.id}/sections`);
      if (res.data.success && res.data.data.length > 0) {
        setSections(res.data.data);
        setAssessmentForm((prev) => ({ ...prev, sectionId: res.data.data[0].id }));
      }
    }
    setIsAddAssessmentOpen(true);
  };

  const handleClassChangeInAssessment = async (classId) => {
    setAssessmentForm((prev) => ({ ...prev, classId, sectionId: '' }));
    if (classId) {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) setSections(res.data.data);
    } else {
      setSections([]);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/examinations', examForm);
      toast.success('Examination created in Neon');
      setIsAddExamOpen(false);
      fetchInitialSetup();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    setSaving(true);
    try {
      await api.post('/assessments', {
        ...assessmentForm,
        examinationId: selectedExam.id,
      });
      toast.success('Assessment created in Neon');
      setIsAddAssessmentOpen(false);
      fetchInitialSetup();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Examination Name',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-charcoal">{row.name}</span>,
    },
    {
      header: 'Type',
      accessor: 'examType',
      render: (row) => <Badge variant="olive">{row.examType}</Badge>,
    },
    {
      header: 'Academic Term',
      accessor: 'semesterName',
      render: (row) => (
        <span>{row.academicYearName} — {row.semesterName}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'COMPLETED' ? 'success' : 'sage'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Created Assessments',
      accessor: 'assessments',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.assessments?.map((a) => (
            <span key={a.id} className="text-[10px] font-semibold bg-olive-50 text-olive-800 px-2 py-0.5 rounded border border-olive-200">
              {a.className} {a.sectionName}: {a.subjectCode} (Max {a.maxMarks})
            </span>
          ))}
          <button
            onClick={() => handleOpenAddAssessment(row)}
            className="text-[10px] font-medium text-olive-600 hover:text-olive-700 underline ml-1"
          >
            + Add Assessment
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Examinations & Assessments</h2>
          <p className="text-xs text-muted">Manage institution exams, quizzes, midterms, and subject assessments</p>
        </div>
        <button
          onClick={() => {
            setExamForm({
              name: '',
              examType: 'MIDTERM',
              academicYearId: years[0]?.id || '',
              semesterId: semesters[0]?.id || '',
              startDate: '2026-10-10',
              endDate: '2026-10-20',
              description: '',
            });
            setIsAddExamOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination</span>
        </button>
      </div>

      <DataTable columns={columns} data={examinations} isLoading={loading} searchPlaceholder="Search examinations..." />

      {/* Add Examination Modal */}
      <Modal isOpen={isAddExamOpen} onClose={() => setIsAddExamOpen(false)} title="Schedule Examination">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <FormInput
            label="Examination Title"
            required
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            placeholder="e.g. Midterm Examinations Fall 2026"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Assessment Type</label>
              <select
                value={examForm.examType}
                onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                className="input-field text-xs py-2"
              >
                <option value="MIDTERM">Midterm Exam</option>
                <option value="FINAL">Final Exam</option>
                <option value="INTERNAL">Internal Exam</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
                <option value="PRACTICAL">Practical Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Semester</label>
              <select
                value={examForm.semesterId}
                onChange={(e) => setExamForm({ ...examForm, semesterId: e.target.value })}
                className="input-field text-xs py-2"
                required
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Date"
              type="date"
              value={examForm.startDate}
              onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
            />
            <FormInput
              label="End Date"
              type="date"
              value={examForm.endDate}
              onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
            />
          </div>
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddExamOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Create Examination'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Assessment Modal */}
      <Modal isOpen={isAddAssessmentOpen} onClose={() => setIsAddAssessmentOpen(false)} title={`Create Assessment for ${selectedExam?.name}`}>
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <FormInput
            label="Assessment Name"
            required
            value={assessmentForm.name}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
            placeholder="e.g. Midterm Exam - Mathematics"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Class</label>
              <select
                value={assessmentForm.classId}
                onChange={(e) => handleClassChangeInAssessment(e.target.value)}
                className="input-field text-xs py-2"
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Section</label>
              <select
                value={assessmentForm.sectionId}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, sectionId: e.target.value })}
                className="input-field text-xs py-2"
                required
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Curriculum Subject</label>
            <select
              value={assessmentForm.subjectId}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, subjectId: e.target.value })}
              className="input-field text-xs py-2"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Maximum Marks"
              type="number"
              required
              value={assessmentForm.maxMarks}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, maxMarks: parseFloat(e.target.value) })}
            />
            <FormInput
              label="Passing Marks"
              type="number"
              required
              value={assessmentForm.passingMarks}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, passingMarks: parseFloat(e.target.value) })}
            />
          </div>
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddAssessmentOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExaminationManagement;
