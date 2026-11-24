import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { Plus, MessageSquare, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherRemarks = () => {
  const [students, setStudents] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    category: 'EXCELLENT',
    description: '',
    isPublished: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sRes = await api.get('/students');
      if (sRes.data.success) {
        setStudents(sRes.data.data);
        if (sRes.data.data.length > 0) {
          // Fetch remarks for first student or loop
          const rList = [];
          for (const st of sRes.data.data.slice(0, 10)) {
            const rRes = await api.get(`/remarks/student/${st.id}?onlyPublished=false`);
            if (rRes.data.success) {
              rList.push(...rRes.data.data);
            }
          }
          setRemarks(rList);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRemark = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.description) {
      toast.error('Please select student and enter feedback text');
      return;
    }
    setSaving(true);
    try {
      await api.post('/remarks', form);
      toast.success('Instructor observation recorded in Neon PostgreSQL');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post remark');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'studentFullName',
      render: (row) => (
        <div>
          <p className="font-semibold text-charcoal">{row.studentFullName}</p>
          <p className="text-[10px] text-muted">Roll: {row.studentRollNumber}</p>
        </div>
      ),
    },
    {
      header: 'Instructor',
      accessor: 'teacherFullName',
      render: (row) => <span className="font-medium text-charcoal">{row.teacherFullName}</span>,
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <Badge variant="olive">{row.category}</Badge>,
    },
    {
      header: 'Observation / Feedback',
      accessor: 'description',
      render: (row) => <p className="text-xs text-charcoal/90 max-w-md line-clamp-2">{row.description}</p>,
    },
    {
      header: 'Visibility',
      accessor: 'isPublished',
      render: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'}>
          {row.isPublished ? 'Published to Portal' : 'Internal Draft'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Instructor Remarks & Observations</h2>
          <p className="text-xs text-muted">
            Provide qualitative academic evaluations, homework observations, and behavioral feedback
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              studentId: students[0]?.id || '',
              category: 'EXCELLENT',
              description: '',
              isPublished: true,
            });
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Observation</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={remarks}
        isLoading={loading}
        searchPlaceholder="Search remarks by student, teacher, or keyword..."
      />

      {/* Add Remark Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Instructor Remark">
        <form onSubmit={handleSaveRemark} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Target Scholar</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="input-field text-xs py-2"
              required
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.className} - {st.sectionName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Feedback Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field text-xs py-2"
            >
              <option value="EXCELLENT">Excellent Performance</option>
              <option value="GOOD">Good Performance</option>
              <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
              <option value="HOMEWORK">Homework Feedback</option>
              <option value="PARTICIPATION">Classroom Participation</option>
              <option value="BEHAVIOUR">Behaviour & Conduct</option>
              <option value="PROGRESS">Academic Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Detailed Observation</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide constructive feedback regarding student comprehension, engagement, and focus areas..."
              className="input-field text-xs py-2 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="rounded border-warmgrey text-olive-600 focus:ring-olive-500"
            />
            <label htmlFor="isPublished" className="text-xs text-charcoal select-none">
              Publish immediately to Student and Parent Portal
            </label>
          </div>

          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : 'Post Remark'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherRemarks;
