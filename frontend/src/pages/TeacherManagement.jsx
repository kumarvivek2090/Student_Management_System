import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { Plus, Edit2, Trash2, BookPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [saving, setSaving] = useState(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    teacherId: '',
    qualification: '',
    specialization: '',
  });

  // Assign Form State
  const [assignForm, setAssignForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    academicYearId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, yRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/academic-years'),
      ]);
      if (tRes.data.success) setTeachers(tRes.data.data);
      if (cRes.data.success) setClasses(cRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
      if (yRes.data.success) setAcademicYears(yRes.data.data);
    } catch (e) {
      toast.error('Failed to load faculty information');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignForm({
      classId: classes[0]?.id || '',
      sectionId: '',
      subjectId: subjects[0]?.id || '',
      academicYearId: academicYears[0]?.id || '',
    });
    if (classes[0]?.id) {
      fetchClassSections(classes[0].id);
    }
    setIsAssignOpen(true);
  };

  const fetchClassSections = async (classId) => {
    try {
      const res = await api.get(`/classes/${classId}/sections`);
      if (res.data.success) setSections(res.data.data);
    } catch (e) {
      setSections([]);
    }
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/teachers', teacherForm);
      toast.success('Faculty member registered successfully in Neon');
      setIsAddOpen(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !assignForm.classId || !assignForm.sectionId || !assignForm.subjectId) {
      toast.error('Please fill in all assignment fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/teachers/assign', {
        teacherId: selectedTeacher.id,
        ...assignForm,
      });
      toast.success('Course assigned to instructor in Neon');
      setIsAssignOpen(false);
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to assign class & subject');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Faculty ID',
      accessor: 'teacherId',
      render: (row) => <span className="font-semibold text-charcoal">{row.teacherId}</span>,
    },
    {
      header: 'Full Name',
      accessor: 'fullName',
      render: (row) => (
        <div>
          <p className="font-semibold text-charcoal">{row.fullName}</p>
          <p className="text-[10px] text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      render: (row) => <span>{row.specialization || 'General Faculty'}</span>,
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      render: (row) => <span>{row.qualification || '—'}</span>,
    },
    {
      header: 'Assigned Courses',
      accessor: 'assignments',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.assignments?.length > 0 ? (
            row.assignments.map((a, i) => (
              <span key={i} className="text-[10px] font-medium bg-olive-50 text-olive-800 px-2 py-0.5 rounded border border-olive-200">
                {a.className}-{a.sectionName}: {a.subjectCode}
              </span>
            ))
          ) : (
            <span className="text-muted text-[11px]">No active assignments</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleOpenAssign(row)}
            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center space-x-1"
            title="Assign course"
          >
            <BookPlus className="w-3.5 h-3.5 text-olive-600" />
            <span>Assign Course</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Faculty Management</h2>
          <p className="text-xs text-muted">Register teachers, assign class sections, and map curriculum subjects</p>
        </div>
        <button
          onClick={() => {
            setTeacherForm({
              fullName: '',
              email: '',
              phone: '',
              teacherId: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
              qualification: '',
              specialization: '',
            });
            setIsAddOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Faculty</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        isLoading={loading}
        searchPlaceholder="Search faculty by name, email, specialization..."
      />

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <FormInput
            label="Full Name"
            required
            value={teacherForm.fullName}
            onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
            placeholder="Dr. Eleanor Vance"
          />
          <FormInput
            label="Institutional Email"
            type="email"
            required
            value={teacherForm.email}
            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
            placeholder="eleanor.v@studentreport.com"
          />
          <FormInput
            label="Teacher Identification Number"
            required
            value={teacherForm.teacherId}
            onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
            placeholder="TCH-1001"
          />
          <FormInput
            label="Highest Academic Qualification"
            value={teacherForm.qualification}
            onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
            placeholder="Ph.D. in Pure Mathematics"
          />
          <FormInput
            label="Academic Specialization"
            value={teacherForm.specialization}
            onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
            placeholder="Calculus & Differential Geometry"
          />

          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Registering...' : 'Save Faculty Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Course Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign Course to ${selectedTeacher?.fullName}`}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Select Class</label>
            <select
              value={assignForm.classId}
              onChange={(e) => {
                setAssignForm({ ...assignForm, classId: e.target.value, sectionId: '' });
                fetchClassSections(e.target.value);
              }}
              className="input-field text-xs py-2"
              required
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Select Section</label>
            <select
              value={assignForm.sectionId}
              onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
              className="input-field text-xs py-2"
              required
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Curriculum Subject</label>
            <select
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="input-field text-xs py-2"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAssignOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
