import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { Plus, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState(null);
  const [saving, setSaving] = useState(false);

  const [classForm, setClassForm] = useState({ name: '', gradeLevel: 10, description: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: 40, roomNumber: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      if (res.data.success) setClasses(res.data.data);
    } catch (e) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/classes', classForm);
      toast.success('Class created in Neon');
      setIsAddClassOpen(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!selectedClassForSection) return;
    setSaving(true);
    try {
      await api.post(`/classes/${selectedClassForSection.id}/sections`, sectionForm);
      toast.success('Section created in Neon');
      setIsAddSectionOpen(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Class removed');
      fetchClasses();
    } catch (e) {
      toast.error('Failed to delete class');
    }
  };

  const columns = [
    {
      header: 'Class Name',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-charcoal">{row.name}</span>,
    },
    {
      header: 'Grade Level',
      accessor: 'gradeLevel',
      render: (row) => <span className="font-medium text-charcoal">Grade {row.gradeLevel}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => <span className="text-muted">{row.description || '—'}</span>,
    },
    {
      header: 'Assigned Sections',
      accessor: 'sections',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.sections?.map((sec) => (
            <span key={sec.id} className="text-[10px] font-semibold bg-olive-50 text-olive-800 px-2 py-0.5 rounded border border-olive-200">
              Sec {sec.name} ({sec.capacity} seats)
            </span>
          ))}
          <button
            onClick={() => {
              setSelectedClassForSection(row);
              setSectionForm({ name: '', capacity: 40, roomNumber: '' });
              setIsAddSectionOpen(true);
            }}
            className="text-[10px] font-medium text-olive-600 hover:text-olive-700 underline ml-1"
          >
            + Add Section
          </button>
        </div>
      ),
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => handleDeleteClass(row.id)}
          className="p-1 rounded hover:bg-red-50 text-muted hover:text-red-600"
          title="Delete class"
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
          <h2 className="text-xl font-bold text-charcoal">Class & Section Management</h2>
          <p className="text-xs text-muted">Configure academic grades, cohort rooms, and section capacities</p>
        </div>
        <button
          onClick={() => {
            setClassForm({ name: '', gradeLevel: 10, description: '' });
            setIsAddClassOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Class</span>
        </button>
      </div>

      <DataTable columns={columns} data={classes} isLoading={loading} searchPlaceholder="Search classes..." />

      {/* Add Class Modal */}
      <Modal isOpen={isAddClassOpen} onClose={() => setIsAddClassOpen(false)} title="Create Academic Class">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <FormInput
            label="Class Name"
            required
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            placeholder="e.g. Grade 10"
          />
          <FormInput
            label="Numeric Grade Level"
            type="number"
            required
            value={classForm.gradeLevel}
            onChange={(e) => setClassForm({ ...classForm, gradeLevel: parseInt(e.target.value) })}
          />
          <FormInput
            label="Description"
            value={classForm.description}
            onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
            placeholder="e.g. Sophomore Secondary Level"
          />
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddClassOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        title={`Add Section to ${selectedClassForSection?.name}`}
      >
        <form onSubmit={handleCreateSection} className="space-y-4">
          <FormInput
            label="Section Identifier"
            required
            value={sectionForm.name}
            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
            placeholder="e.g. A, B, or C"
          />
          <FormInput
            label="Seating Capacity"
            type="number"
            value={sectionForm.capacity}
            onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) })}
          />
          <FormInput
            label="Room / Hall Number"
            value={sectionForm.roomNumber}
            onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
            placeholder="e.g. Room 104"
          />
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddSectionOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassManagement;
