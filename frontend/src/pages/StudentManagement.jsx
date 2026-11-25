import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { SkeletonTable, ErrorState } from '../components/common/Skeleton';
import { Plus, Edit2, Trash2, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const queryClient = useQueryClient();

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Dropdown lists
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    studentId: '',
    rollNumber: '',
    classId: '',
    sectionId: '',
    academicYearId: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationshipType: 'GUARDIAN',
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(0); // reset to page 0 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Load static filters once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cRes, yRes] = await Promise.all([
          api.get('/classes'),
          api.get('/academic-years')
        ]);
        if (cRes.data.success) setClasses(cRes.data.data);
        if (yRes.data.success) setAcademicYears(yRes.data.data);
      } catch (e) {
        console.error('Failed to load filter options', e);
      }
    };
    loadFilters();
  }, []);

  // Fetch sections when filterClass changes
  useEffect(() => {
    if (filterClass) {
      api.get(`/classes/${filterClass}/sections`)
        .then((res) => {
          if (res.data.success) setSections(res.data.data);
        })
        .catch(() => setSections([]));
    } else {
      setSections([]);
      setFilterSection('');
    }
    setPage(0);
  }, [filterClass]);

  // TanStack Query for Paginated Student Directory
  const {
    data: pageData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['students', { page, pageSize, filterClass, filterSection, debouncedQuery }],
    queryFn: async () => {
      const params = {
        paged: true,
        page,
        size: pageSize,
      };
      if (filterClass) params.classId = filterClass;
      if (filterSection) params.sectionId = filterSection;
      if (debouncedQuery) params.query = debouncedQuery;

      const res = await api.get('/students', { params });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch students from Neon');
    },
    staleTime: 30000,
  });

  const students = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  const handleClassChangeInForm = async (classId) => {
    setFormData((prev) => ({ ...prev, classId, sectionId: '' }));
    if (classId) {
      try {
        const res = await api.get(`/classes/${classId}/sections`);
        if (res.data.success) setSections(res.data.data);
      } catch (e) {
        setSections([]);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      studentId: `STD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      rollNumber: '',
      classId: classes[0]?.id || '',
      sectionId: '',
      academicYearId: academicYears[0]?.id || '',
      dateOfBirth: '2010-01-01',
      gender: 'MALE',
      address: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      relationshipType: 'GUARDIAN',
    });
    if (classes[0]?.id) {
      handleClassChangeInForm(classes[0].id);
    }
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = async (st) => {
    setEditingStudent(st);
    if (st.classId) {
      try {
        const res = await api.get(`/classes/${st.classId}/sections`);
        if (res.data.success) setSections(res.data.data);
      } catch (e) {}
    }
    setFormData({
      fullName: st.fullName || '',
      email: st.email || '',
      phone: st.phone || '',
      password: '',
      studentId: st.studentId || '',
      rollNumber: st.rollNumber || '',
      classId: st.classId || '',
      sectionId: st.sectionId || '',
      academicYearId: st.academicYearId || '',
      dateOfBirth: st.dateOfBirth || '',
      gender: st.gender || 'MALE',
      address: st.address || '',
      parentName: st.parentName || '',
      parentEmail: st.parentEmail || '',
      parentPhone: st.parentPhone || '',
      relationshipType: 'GUARDIAN',
    });
    setIsAddEditOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student record updated in Neon database');
      } else {
        await api.post('/students', formData);
        toast.success('New student persisted to Neon database');
      }
      setIsAddEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save student';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setSaving(true);
    try {
      await api.delete(`/students/${studentToDelete.id}`);
      toast.success('Student removed from Neon database');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    } catch (err) {
      toast.error('Failed to delete student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-forest dark:text-white">Student Directory</h2>
          <p className="text-xs text-muted dark:text-[#CAD6B7] mt-0.5">
            Official enrollment directory powered by Neon PostgreSQL with server-side indexing.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs shadow-sm flex items-center space-x-1.5"
            title="Refresh student records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-olive-600 dark:text-[#B2D297]' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Sync'}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs shadow-card flex items-center space-x-1.5 py-2 px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="card-premium p-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-[#182216] border border-warmgrey dark:border-[#283623]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted dark:text-[#A8B49E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, student ID, email, roll no..."
            className="input-field pl-9 text-xs py-2 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-muted dark:text-[#CAD6B7]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="input-field text-xs py-1.5 px-2.5 bg-cream/30 dark:bg-[#131A12]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterSection}
            onChange={(e) => {
              setFilterSection(e.target.value);
              setPage(0);
            }}
            disabled={!filterClass || sections.length === 0}
            className="input-field text-xs py-1.5 px-2.5 bg-cream/30 dark:bg-[#131A12] disabled:opacity-50"
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {(filterClass || filterSection || searchInput) && (
            <button
              onClick={() => {
                setFilterClass('');
                setFilterSection('');
                setSearchInput('');
                setPage(0);
              }}
              className="text-xs text-olive-700 hover:text-olive-900 dark:text-[#B2D297] dark:hover:text-[#C5E8A8] font-semibold px-2 py-1 rounded hover:bg-cream dark:hover:bg-[#222E1E]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. TABLE / SKELETON / ERROR / EMPTY STATE */}
      {isLoading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : isError ? (
        <ErrorState
          message={error?.userMessage || error?.message || 'Failed to retrieve students from Neon database.'}
          onRetry={() => refetch()}
        />
      ) : students.length === 0 ? (
        <div className="card-premium p-12 text-center bg-white space-y-3">
          <div className="w-12 h-12 rounded-full bg-cream text-muted flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6 text-muted" />
          </div>
          <h3 className="text-sm font-bold text-charcoal">No Student Records Found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {debouncedQuery || filterClass
              ? 'No students matched the active filter criteria. Try adjusting your search query.'
              : 'There are currently no students registered in Neon PostgreSQL. Click "Add New Student" to enroll your first student.'}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-1.5 px-4 mt-2">
            Add First Student
          </button>
        </div>
      ) : (
        <div className="card-premium overflow-hidden bg-white dark:bg-[#182216] border border-warmgrey dark:border-[#283623]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-warmgrey/60 dark:divide-[#283623] text-left text-xs">
              <thead className="bg-cream/60 dark:bg-[#131A12] text-muted dark:text-[#CAD6B7] font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Full Name & Email</th>
                  <th className="px-4 py-3 text-center">Roll No</th>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgrey/40 dark:divide-[#283623] bg-white dark:bg-[#182216]">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-ivory/50 dark:hover:bg-[#212C1D] transition-colors">
                    <td className="px-4 py-3 font-semibold text-charcoal dark:text-white font-mono">
                      {st.studentId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-charcoal dark:text-white">{st.fullName}</p>
                      <p className="text-[10px] text-muted dark:text-[#A8B49E]">{st.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-forest dark:text-[#B2D297] font-mono">
                      {st.rollNumber}
                    </td>
                    <td className="px-4 py-3 text-[#242820] dark:text-[#E8EDE4]">
                      <span>{st.className ? `${st.className} (${st.sectionName || '—'})` : 'Unassigned'}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted dark:text-[#A8B49E]">
                      {st.gender?.toLowerCase() || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal dark:text-white">
                      <p>{st.parentName || '—'}</p>
                      {st.parentPhone && <p className="text-[10px] text-muted dark:text-[#A8B49E]">{st.parentPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={st.status === 'ACTIVE' ? 'olive' : 'default'}>
                        {st.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1 rounded hover:bg-cream dark:hover:bg-[#222E1E] text-muted dark:text-[#CAD6B7] hover:text-charcoal dark:hover:text-white"
                          title="Edit student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(st);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-rose-950/40 text-muted dark:text-[#CAD6B7] hover:text-red-600 dark:hover:text-rose-400"
                          title="Delete student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. SERVER-SIDE PAGINATION FOOTER */}
          <div className="p-4 border-t border-warmgrey/60 dark:border-[#283623] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted dark:text-[#CAD6B7] bg-cream/20 dark:bg-[#131A12]">
            <div>
              Showing <span className="font-semibold text-charcoal dark:text-white">{page * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-charcoal dark:text-white">
                {Math.min(totalElements, (page + 1) * pageSize)}
              </span>{' '}
              of <span className="font-semibold text-charcoal dark:text-white">{totalElements}</span> registered students
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-medium text-charcoal dark:text-white">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT STUDENT MODAL */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.fullName}` : 'Enroll New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Full Legal Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Benjamin Hayes"
            />
            <FormInput
              label="Institutional Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="benjamin.hayes@studentreport.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput
              label="Student ID"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="STD-2026-001"
            />
            <FormInput
              label="Roll Number"
              required
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              placeholder="101"
            />
            <FormInput
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2831"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Academic Class</label>
              <select
                value={formData.classId}
                onChange={(e) => handleClassChangeInForm(e.target.value)}
                className="input-field text-xs py-2 w-full"
                required
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Assigned Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="input-field text-xs py-2 w-full"
                required
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Academic Year</label>
              <select
                value={formData.academicYearId}
                onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                className="input-field text-xs py-2 w-full"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-field text-xs py-2 w-full"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-warmgrey/60 space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider">Guardian Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormInput
                label="Guardian Full Name"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Richard Hayes"
              />
              <FormInput
                label="Guardian Email"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="richard.hayes@gmail.com"
              />
              <FormInput
                label="Guardian Phone"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+1 (555) 998-1234"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-warmgrey/60">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs shadow-card"
            >
              {saving ? 'Persisting to Neon...' : editingStudent ? 'Update Record' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Remove Student Record"
        message={`Are you sure you want to deactivate and remove ${studentToDelete?.fullName} (ID: ${studentToDelete?.studentId}) from the Neon database? This will purge related evaluation marks.`}
        confirmText={saving ? 'Deleting...' : 'Delete Record'}
        variant="danger"
      />
    </div>
  );
};

export default StudentManagement;
