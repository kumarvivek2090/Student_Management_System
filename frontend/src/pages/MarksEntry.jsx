import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  Award,
  CheckCircle2,
  Save,
  Filter,
  AlertCircle,
  Plus,
  BookOpen,
  Users,
  Percent,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const MarksEntry = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // Selection state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');

  // Assessment details & students marks list
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Quick fill modal/state
  const [quickFillValue, setQuickFillValue] = useState('');

  // Create assessment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    examinationId: '',
    subjectId: '',
    name: '',
    maxMarks: '100',
    passingMarks: '40',
    weightage: '100',
    assessmentDate: new Date().toISOString().split('T')[0],
  });

  // 1. Initial Load of Setup Data (Classes, Exams, Subjects)
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingSetup(true);
    try {
      const [cRes, eRes, subRes] = await Promise.all([
        api.get('/classes'),
        api.get('/examinations'),
        api.get('/subjects'),
      ]);

      const classList = cRes.data?.data || [];
      const examList = eRes.data?.data || [];
      const subjectList = subRes.data?.data || [];

      setClasses(classList);
      setExaminations(examList);
      setSubjects(subjectList);

      if (examList.length > 0) {
        setNewAssessment((prev) => ({ ...prev, examinationId: examList[0].id }));
      }
      if (subjectList.length > 0) {
        setNewAssessment((prev) => ({ ...prev, subjectId: subjectList[0].id }));
      }

      // Auto-select first class & section if available to prevent blank screen
      if (classList.length > 0) {
        const firstClass = classList[0];
        setSelectedClass(firstClass.id);
        const secList = firstClass.sections || [];
        setSections(secList);

        if (secList.length > 0) {
          const firstSec = secList[0];
          setSelectedSection(firstSec.id);
          // Trigger assessment loading for first class & section
          loadAssessments(firstClass.id, firstSec.id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial setup data', err);
      toast.error('Unable to fetch academic classes and examinations');
    } finally {
      setLoadingSetup(false);
    }
  };

  // 2. Load Assessments for a specific Class & Section
  const loadAssessments = async (classId, sectionId, preferredAssessmentId = null) => {
    if (!classId || !sectionId) {
      setAssessments([]);
      setCurrentAssessment(null);
      setStudentMarks([]);
      return;
    }

    try {
      const res = await api.get(`/assessments/class/${classId}/section/${sectionId}`);
      const list = res.data?.data || [];
      setAssessments(list);

      if (list.length > 0) {
        const target = preferredAssessmentId
          ? list.find((a) => a.id === preferredAssessmentId) || list[0]
          : list[0];
        setSelectedAssessment(target.id);
        loadStudentRoster(classId, sectionId, target);
      } else {
        setSelectedAssessment('');
        setCurrentAssessment(null);
        setStudentMarks([]);
      }
    } catch (err) {
      console.error('Failed to load assessments', err);
      toast.error('Could not load class assessments');
    }
  };

  // 3. Load Students and Existing Marks
  const loadStudentRoster = async (classId, sectionId, assessmentObj) => {
    if (!assessmentObj) return;
    setLoadingRoster(true);
    setCurrentAssessment(assessmentObj);

    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/students', { params: { classId, sectionId } }),
        api.get(`/marks/assessment/${assessmentObj.id}`),
      ]);

      const students = sRes.data?.data || [];
      const marksList = mRes.data?.data || [];

      const marksMap = new Map();
      marksList.forEach((m) => marksMap.set(m.studentId, m));

      const rows = students.map((st) => {
        const em = marksMap.get(st.id);
        const marksVal = em && em.obtainedMarks !== null && em.obtainedMarks !== undefined ? em.obtainedMarks : '';
        return {
          studentId: st.id,
          fullName: st.fullName,
          studentCode: st.studentId,
          rollNumber: st.rollNumber || '—',
          obtainedMarks: marksVal,
          isAbsent: em ? !!em.isAbsent : false,
          remarks: em ? em.remarks || '' : '',
          grade: em ? em.grade : calculateGrade(marksVal, assessmentObj.maxMarks),
          saved: !!em,
        };
      });

      setStudentMarks(rows);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to load student assessment roster', err);
      toast.error('Failed to load student assessment roster');
    } finally {
      setLoadingRoster(false);
    }
  };

  // Client-side instant grading scale resolution
  const calculateGrade = (obtained, max) => {
    if (obtained === '' || obtained === null || obtained === undefined) return '—';
    const num = parseFloat(obtained);
    if (isNaN(num)) return '—';
    const pct = (num / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  // Handler: Change Class
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedAssessment('');
    setCurrentAssessment(null);
    setStudentMarks([]);

    const foundClass = classes.find((c) => c.id === classId);
    const secList = foundClass?.sections || [];
    setSections(secList);

    if (secList.length > 0) {
      const firstSecId = secList[0].id;
      setSelectedSection(firstSecId);
      loadAssessments(classId, firstSecId);
    } else {
      setSelectedSection('');
      setAssessments([]);
    }
  };

  // Handler: Change Section
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedAssessment('');
    setCurrentAssessment(null);
    setStudentMarks([]);
    if (selectedClass && sectionId) {
      loadAssessments(selectedClass, sectionId);
    }
  };

  // Handler: Change Assessment
  const handleAssessmentChange = (assessmentId) => {
    setSelectedAssessment(assessmentId);
    const aObj = assessments.find((a) => a.id === assessmentId);
    if (aObj) {
      loadStudentRoster(selectedClass, selectedSection, aObj);
    } else {
      setCurrentAssessment(null);
      setStudentMarks([]);
    }
  };

  // Row mark change with instant grade update
  const handleMarkChange = (index, val) => {
    const updated = [...studentMarks];
    updated[index].obtainedMarks = val;
    if (currentAssessment) {
      updated[index].grade = calculateGrade(val, currentAssessment.maxMarks);
    }
    setStudentMarks(updated);
    setIsDirty(true);
  };

  // Row absent toggle
  const handleAbsentChange = (index, isAbsent) => {
    const updated = [...studentMarks];
    updated[index].isAbsent = isAbsent;
    if (isAbsent) {
      updated[index].obtainedMarks = 0;
      updated[index].grade = 'AB';
    } else {
      if (updated[index].obtainedMarks === 0) {
        updated[index].obtainedMarks = '';
        updated[index].grade = '—';
      }
    }
    setStudentMarks(updated);
    setIsDirty(true);
  };

  // Row remark change
  const handleRemarkChange = (index, val) => {
    const updated = [...studentMarks];
    updated[index].remarks = val;
    setStudentMarks(updated);
    setIsDirty(true);
  };

  // Quick action: Fill all with score
  const handleApplyQuickFill = () => {
    if (!quickFillValue || isNaN(parseFloat(quickFillValue))) {
      toast.error('Please enter a valid numeric mark');
      return;
    }
    const score = parseFloat(quickFillValue);
    if (currentAssessment && score > currentAssessment.maxMarks) {
      toast.error(`Score cannot exceed max marks of ${currentAssessment.maxMarks}`);
      return;
    }

    const updated = studentMarks.map((s) => ({
      ...s,
      isAbsent: false,
      obtainedMarks: score,
      grade: currentAssessment ? calculateGrade(score, currentAssessment.maxMarks) : s.grade,
    }));
    setStudentMarks(updated);
    setIsDirty(true);
    setQuickFillValue('');
    toast.success(`Applied score of ${score} to all students`);
  };

  // Quick action: Clear all
  const handleClearAll = () => {
    if (!window.confirm('Clear all entered marks on this sheet?')) return;
    const updated = studentMarks.map((s) => ({
      ...s,
      obtainedMarks: '',
      isAbsent: false,
      grade: '—',
      remarks: '',
    }));
    setStudentMarks(updated);
    setIsDirty(true);
  };

  // Save all marks to backend Neon PostgreSQL
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
            `Mark for ${sm.fullName} (${num}) exceeds maximum allowed (${currentAssessment.maxMarks})`
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
        toast.success('Marks recorded and persisted to Neon PostgreSQL!');
        const resultMap = new Map(res.data.data.map((m) => [m.studentId, m]));
        setStudentMarks((prev) =>
          prev.map((p) => {
            const m = resultMap.get(p.studentId);
            return m ? { ...p, grade: m.grade, saved: true } : p;
          })
        );
        setIsDirty(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to persist marks to database');
    } finally {
      setSaving(false);
    }
  };

  // Create Assessment Handler
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!newAssessment.examinationId || !newAssessment.subjectId || !newAssessment.name) {
      toast.error('Please fill in examination, subject, and assessment name');
      return;
    }

    setCreatingAssessment(true);
    try {
      const payload = {
        examinationId: newAssessment.examinationId,
        classId: selectedClass,
        sectionId: selectedSection,
        subjectId: newAssessment.subjectId,
        name: newAssessment.name.trim(),
        maxMarks: parseFloat(newAssessment.maxMarks),
        passingMarks: parseFloat(newAssessment.passingMarks),
        weightage: parseFloat(newAssessment.weightage || 100),
        assessmentDate: newAssessment.assessmentDate,
      };

      const res = await api.post('/assessments', payload);
      if (res.data.success) {
        toast.success(`Assessment "${newAssessment.name}" created!`);
        setShowCreateModal(false);
        setNewAssessment((prev) => ({
          ...prev,
          name: '',
          maxMarks: '100',
          passingMarks: '40',
        }));
        // Reload assessments and auto-select the newly created assessment
        loadAssessments(selectedClass, selectedSection, res.data.data.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setCreatingAssessment(false);
    }
  };

  // Computed summary metrics for current sheet
  const metrics = useMemo(() => {
    if (!studentMarks.length || !currentAssessment) return null;
    const scored = studentMarks.filter((s) => !s.isAbsent && s.obtainedMarks !== '' && !isNaN(parseFloat(s.obtainedMarks)));
    const absents = studentMarks.filter((s) => s.isAbsent).length;
    const total = studentMarks.length;
    if (!scored.length) {
      return { total, scoredCount: 0, absents, average: 0, passCount: 0, passRate: 0 };
    }
    const sum = scored.reduce((acc, curr) => acc + parseFloat(curr.obtainedMarks), 0);
    const average = (sum / scored.length).toFixed(1);
    const passCount = scored.filter((s) => parseFloat(s.obtainedMarks) >= currentAssessment.passingMarks).length;
    const passRate = ((passCount / scored.length) * 100).toFixed(0);

    return { total, scoredCount: scored.length, absents, average, passCount, passRate };
  }, [studentMarks, currentAssessment]);

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#242820] font-serif">Assessment Marks Entry</h2>
          <p className="text-xs text-[#555B50] mt-0.5">
            Direct database entry with live percentage calculation, grading scale resolution, and validation.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Unsaved Changes Detected</span>
          </div>
        )}
      </div>

      {/* Selectors & Filters Card */}
      <div className="card-premium p-5 bg-[#F8F7F2] border border-[#E3E1D6]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          
          {/* Class Selector */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              1. Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              2. Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClass}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none disabled:bg-[#F0EFE6] disabled:text-[#74796D]"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          {/* Assessment Target Selector */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
              3. Assessment Target
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => handleAssessmentChange(e.target.value)}
              disabled={!selectedSection || assessments.length === 0}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2.5 text-xs text-[#242820] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none disabled:bg-[#F0EFE6] disabled:text-[#74796D]"
            >
              <option value="">
                {assessments.length === 0 ? 'No assessments found' : 'Select Assessment'}
              </option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.subjectName} • Max: {a.maxMarks})
                </option>
              ))}
            </select>
          </div>

          {/* Create Assessment Button */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              disabled={!selectedClass || !selectedSection}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F0EFE6] border border-[#E3E1D6] text-[#52613B] text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Create new assessment for this class"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>

        </div>

        {/* Available Assessments Pills (1-Click Switcher) */}
        {assessments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E3E1D6]">
            <span className="text-[11px] font-semibold text-[#555B50] block mb-2">
              Available Assessments in Section:
            </span>
            <div className="flex flex-wrap gap-2">
              {assessments.map((a) => {
                const isSelected = selectedAssessment === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleAssessmentChange(a.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-[#52613B] text-white border-[#52613B] shadow-xs'
                        : 'bg-white hover:bg-[#F0EFE6] text-[#242820] border-[#E3E1D6]'
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-[#CAD6B7]' : 'text-[#52613B]'}`} />
                    <span>{a.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#3F4D2D] text-white' : 'bg-[#F0EFE6] text-[#555B50]'}`}>
                      {a.subjectCode} • {a.maxMarks}M
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Main Assessment Roster Table & Workspace */}
      {loadingSetup || loadingRoster ? (
        <LoadingSpinner message="Retrieving assessment roster from Neon Cloud PostgreSQL..." />
      ) : currentAssessment && studentMarks.length > 0 ? (
        <div className="space-y-4">
          
          {/* Quick Metrics & Batch Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Quick Metrics */}
            <div className="md:col-span-7 flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white px-3 py-2 rounded-xl border border-[#E3E1D6] shadow-xs flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-[#52613B]" />
                <span className="text-[#555B50]">Students:</span>
                <strong className="text-[#242820]">{metrics?.total || studentMarks.length}</strong>
              </div>

              <div className="bg-white px-3 py-2 rounded-xl border border-[#E3E1D6] shadow-xs flex items-center space-x-2">
                <Percent className="w-3.5 h-3.5 text-[#52613B]" />
                <span className="text-[#555B50]">Class Avg:</span>
                <strong className="text-[#52613B]">{metrics?.average || '0'} / {currentAssessment.maxMarks}</strong>
              </div>

              <div className="bg-white px-3 py-2 rounded-xl border border-[#E3E1D6] shadow-xs flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#247A55]" />
                <span className="text-[#555B50]">Pass Rate:</span>
                <strong className="text-[#247A55]">{metrics?.passRate || '0'}%</strong>
              </div>

              {metrics?.absents > 0 && (
                <div className="bg-red-50 text-red-800 px-3 py-2 rounded-xl border border-red-200 text-xs flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{metrics.absents} Absent</span>
                </div>
              )}
            </div>

            {/* Quick Batch Tools */}
            <div className="md:col-span-5 flex items-center justify-end space-x-2">
              <div className="flex items-center space-x-1.5 bg-white border border-[#E3E1D6] rounded-xl px-2 py-1 shadow-xs">
                <span className="text-[11px] text-[#555B50]">Quick score:</span>
                <input
                  type="number"
                  min="0"
                  max={currentAssessment.maxMarks}
                  placeholder="85"
                  value={quickFillValue}
                  onChange={(e) => setQuickFillValue(e.target.value)}
                  className="w-14 text-xs py-1 px-1.5 border border-[#E3E1D6] rounded-lg text-center outline-none focus:border-[#52613B]"
                />
                <button
                  type="button"
                  onClick={handleApplyQuickFill}
                  className="text-xs bg-[#52613B] hover:bg-[#3F4D2D] text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Fill All
                </button>
              </div>

              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs bg-white hover:bg-red-50 text-red-700 border border-[#E3E1D6] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                title="Clear all entered marks"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={saving}
                className="py-2 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-card hover:shadow-card-hover transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save All Marks'}</span>
              </button>
            </div>

          </div>

          {/* Roster Table Card */}
          <div className="card-premium overflow-hidden bg-white border border-[#E3E1D6] rounded-2xl shadow-card">
            
            {/* Table Header Banner */}
            <div className="p-4 border-b border-[#E3E1D6] bg-[#F8F7F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#242820]">
                  {currentAssessment.name} — Student Marks Sheet
                </h3>
                <p className="text-[11px] text-[#555B50] mt-0.5">
                  Subject: <strong className="text-[#242820]">{currentAssessment.subjectName}</strong> ({currentAssessment.subjectCode}) • Max Marks: <strong className="text-[#52613B]">{currentAssessment.maxMarks}</strong> • Passing Threshold: <strong className="text-[#242820]">{currentAssessment.passingMarks}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-[#52613B] bg-[#F0EFE6] border border-[#E3E1D6] px-2.5 py-1 rounded-full">
                  Neon PostgreSQL Active
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
                <thead className="bg-[#F0EFE6] text-[#242820] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 w-16">Roll</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Student ID</th>
                    <th className="px-4 py-3.5 text-center w-20">Absent?</th>
                    <th className="px-4 py-3.5 w-44">Obtained Marks (/ {currentAssessment.maxMarks})</th>
                    <th className="px-4 py-3.5 text-center w-24">Live Grade</th>
                    <th className="px-4 py-3.5">Teacher Feedback / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E1D6] bg-white">
                  {studentMarks.map((st, idx) => {
                    const isPassed = !st.isAbsent && parseFloat(st.obtainedMarks) >= currentAssessment.passingMarks;
                    return (
                      <tr key={st.studentId} className="hover:bg-[#F8F7F2] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#242820]">{st.rollNumber}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[#242820] block">{st.fullName}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#555B50]">{st.studentCode}</td>
                        
                        {/* Absent Checkbox */}
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={st.isAbsent}
                            onChange={(e) => handleAbsentChange(idx, e.target.checked)}
                            className="h-4 w-4 rounded border-[#E3E1D6] text-[#B84040] focus:ring-[#B84040] cursor-pointer"
                          />
                        </td>

                        {/* Obtained Marks Input */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max={currentAssessment.maxMarks}
                              step="0.5"
                              disabled={st.isAbsent}
                              value={st.obtainedMarks}
                              onChange={(e) => handleMarkChange(idx, e.target.value)}
                              placeholder="0.0"
                              className={`w-28 py-1.5 px-3 rounded-lg border text-xs font-semibold outline-none transition-colors ${
                                st.isAbsent
                                  ? 'bg-[#F0EFE6] text-[#74796D] border-[#E3E1D6] cursor-not-allowed'
                                  : parseFloat(st.obtainedMarks) > currentAssessment.maxMarks
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-[#E3E1D6] bg-white text-[#242820] focus:border-[#52613B]'
                              }`}
                            />
                            <span className="text-[11px] text-[#74796D]">/ {currentAssessment.maxMarks}</span>
                          </div>
                        </td>

                        {/* Live Grade Badge */}
                        <td className="px-4 py-3 text-center">
                          {st.isAbsent ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              AB
                            </span>
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isPassed
                                ? 'bg-emerald-100 text-[#247A55] border border-emerald-200'
                                : st.grade === '—'
                                ? 'bg-[#F0EFE6] text-[#74796D]'
                                : 'bg-red-100 text-[#B84040] border border-red-200'
                            }`}>
                              {st.grade}
                            </span>
                          )}
                        </td>

                        {/* Remarks Input */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={st.remarks}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            placeholder="e.g. Excellent problem solving skills"
                            className="w-full py-1.5 px-3 rounded-lg border border-[#E3E1D6] bg-white text-xs text-[#242820] placeholder-[#74796D] outline-none focus:border-[#52613B]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-[#F8F7F2] border-t border-[#E3E1D6] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#555B50]">
                All scores are validated and saved directly into Neon Cloud PostgreSQL.
              </span>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold flex items-center space-x-2 shadow-card transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving to Database...' : 'Save All Assessment Marks'}</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State with Guidance (Never blank!) */
        <div className="card-premium p-10 bg-white border border-[#E3E1D6] rounded-2xl text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EFE6] border border-[#E3E1D6] flex items-center justify-center mx-auto text-[#52613B]">
            <Award className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#242820] font-serif">
              {assessments.length === 0
                ? 'No Assessment Targets Found'
                : 'Select an Assessment Target'}
            </h3>
            <p className="text-xs text-[#555B50] mt-1.5 leading-relaxed">
              {assessments.length === 0
                ? `No examinations or assessments are currently scheduled for ${
                    classes.find((c) => c.id === selectedClass)?.name || 'this class'
                  }. You can create an assessment now to start entering marks.`
                : 'Select one of the assessment targets above to load the student roster and enter grades.'}
            </p>
          </div>

          {assessments.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                disabled={!selectedClass || !selectedSection}
                className="py-2.5 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-xs font-semibold inline-flex items-center space-x-1.5 shadow-card transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Assessment for this Class</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Assessment */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Examination Assessment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#242820] mb-1">Examination Session</label>
            <select
              required
              value={newAssessment.examinationId}
              onChange={(e) => setNewAssessment({ ...newAssessment, examinationId: e.target.value })}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2 text-xs text-[#242820] focus:border-[#52613B]"
            >
              <option value="">Select Examination</option>
              {examinations.map((e) => (
                <option key={e.id} value={e.id}>{e.name} ({e.academicYearName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#242820] mb-1">Subject</label>
            <select
              required
              value={newAssessment.subjectId}
              onChange={(e) => setNewAssessment({ ...newAssessment, subjectId: e.target.value })}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2 text-xs text-[#242820] focus:border-[#52613B]"
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#242820] mb-1">Assessment Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Examination - Physics"
              value={newAssessment.name}
              onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
              className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2 text-xs text-[#242820] focus:border-[#52613B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#242820] mb-1">Maximum Marks</label>
              <input
                type="number"
                required
                min="1"
                value={newAssessment.maxMarks}
                onChange={(e) => setNewAssessment({ ...newAssessment, maxMarks: e.target.value })}
                className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2 text-xs text-[#242820] focus:border-[#52613B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#242820] mb-1">Passing Marks</label>
              <input
                type="number"
                required
                min="1"
                value={newAssessment.passingMarks}
                onChange={(e) => setNewAssessment({ ...newAssessment, passingMarks: e.target.value })}
                className="w-full bg-white border border-[#E3E1D6] rounded-xl px-3 py-2 text-xs text-[#242820] focus:border-[#52613B]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E1D6] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl border border-[#E3E1D6] text-[#555B50] hover:bg-[#F0EFE6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingAssessment}
              className="px-4 py-2 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white font-semibold flex items-center space-x-1.5"
            >
              <span>{creatingAssessment ? 'Creating...' : 'Create Assessment'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarksEntry;
