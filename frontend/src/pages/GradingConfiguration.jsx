import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { Plus, Sliders, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const GradingConfiguration = () => {
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    grade: '',
    minPercentage: 0,
    maxPercentage: 100,
    gradePoint: 4.0,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchScales();
  }, []);

  const fetchScales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grading-scales');
      if (res.data.success) setScales(res.data.data);
    } catch (e) {
      toast.error('Failed to load grading scales');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/grading-scales', form);
      toast.success('Grading scale rule updated in Neon');
      setIsAddOpen(false);
      fetchScales();
    } catch (err) {
      toast.error('Failed to save grading scale');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Letter Grade',
      accessor: 'grade',
      render: (row) => <Badge variant="olive">{row.grade}</Badge>,
    },
    {
      header: 'Percentage Range',
      accessor: 'minPercentage',
      render: (row) => (
        <span className="font-semibold text-charcoal">
          {row.minPercentage}% — {row.maxPercentage}%
        </span>
      ),
    },
    {
      header: 'Grade Point',
      accessor: 'gradePoint',
      render: (row) => <span className="font-bold text-olive-800">{row.gradePoint}</span>,
    },
    {
      header: 'Institutional Descriptor',
      accessor: 'description',
      render: (row) => <span className="text-muted">{row.description || '—'}</span>,
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span className="inline-flex items-center text-xs text-emerald-700 font-medium">
          <Check className="w-3.5 h-3.5 mr-1" /> Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Grading Scale Configuration</h2>
          <p className="text-xs text-muted">
            Configure institutional letter grades, percentage thresholds, and GPA point mappings
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ grade: '', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.3, description: '', isActive: true });
            setIsAddOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Grade Rule</span>
        </button>
      </div>

      <DataTable columns={columns} data={scales} isLoading={loading} searchPlaceholder="Search grades..." />

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Configure Grade Rule">
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            label="Letter Grade"
            required
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value.toUpperCase() })}
            placeholder="e.g. A+, A, B+"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Minimum Percentage"
              type="number"
              step="0.01"
              required
              value={form.minPercentage}
              onChange={(e) => setForm({ ...form, minPercentage: parseFloat(e.target.value) })}
            />
            <FormInput
              label="Maximum Percentage"
              type="number"
              step="0.01"
              required
              value={form.maxPercentage}
              onChange={(e) => setForm({ ...form, maxPercentage: parseFloat(e.target.value) })}
            />
          </div>
          <FormInput
            label="Grade Point Value (GPA)"
            type="number"
            step="0.1"
            required
            value={form.gradePoint}
            onChange={(e) => setForm({ ...form, gradePoint: parseFloat(e.target.value) })}
          />
          <FormInput
            label="Descriptor"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Outstanding Performance"
          />

          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : 'Save Grade Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradingConfiguration;
