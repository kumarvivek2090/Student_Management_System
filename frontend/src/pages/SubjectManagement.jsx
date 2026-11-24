import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      if (res.data.success) setSubjects(res.data.data);
    } catch (e) {
      toast.error('Failed to load curriculum subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/subjects', form);
      toast.success('Subject saved in Neon');
      setIsAddOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject removed');
      fetchSubjects();
    } catch (e) {
      toast.error('Failed to delete subject');
    }
  };

  const columns = [
    {
      header: 'Subject Code',
      accessor: 'code',
      render: (row) => <span className="font-bold text-olive-800">{row.code}</span>,
    },
    {
      header: 'Course Name',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-charcoal">{row.name}</span>,
    },
    {
      header: 'Credit Weight',
      accessor: 'credits',
      render: (row) => <span>{row.credits} Credits</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => <span className="text-muted text-xs line-clamp-1">{row.description || '—'}</span>,
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1 rounded hover:bg-red-50 text-muted hover:text-red-600"
          title="Delete subject"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Curriculum Subjects</h2>
          <p className="text-xs text-muted">Manage instructional subjects, academic codes, and credit weightings</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', code: '', description: '', credits: 3 });
            setIsAddOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <DataTable columns={columns} data={subjects} isLoading={loading} searchPlaceholder="Search subjects by name or code..." />

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Curriculum Subject">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Course Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Applied Physics"
          />
          <FormInput
            label="Course Code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. PHYS101"
          />
          <FormInput
            label="Academic Credits"
            type="number"
            required
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
          />
          <FormInput
            label="Syllabus Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief scope of course curriculum..."
          />
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectManagement;
