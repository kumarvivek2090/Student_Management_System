import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicYearManagement = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [isAddSemOpen, setIsAddSemOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [saving, setSaving] = useState(false);

  const [yearForm, setYearForm] = useState({
    name: '',
    startDate: '2026-08-15',
    endDate: '2027-06-15',
    isCurrent: true,
  });

  const [semForm, setSemForm] = useState({
    name: '',
    startDate: '2026-08-15',
    endDate: '2026-12-20',
    isCurrent: true,
  });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-years');
      if (res.data.success) setYears(res.data.data);
    } catch (e) {
      toast.error('Failed to load academic calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/academic-years', yearForm);
      toast.success('Academic Year created in Neon');
      setIsAddYearOpen(false);
      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create year');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSem = async (e) => {
    e.preventDefault();
    if (!selectedYear) return;
    setSaving(true);
    try {
      await api.post(`/academic-years/${selectedYear.id}/semesters`, semForm);
      toast.success('Semester created in Neon');
      setIsAddSemOpen(false);
      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create semester');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Academic Year',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-charcoal">{row.name}</span>,
    },
    {
      header: 'Timeline',
      accessor: 'startDate',
      render: (row) => (
        <span className="text-muted">
          {row.startDate} to {row.endDate}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isCurrent',
      render: (row) => (
        <Badge variant={row.isCurrent ? 'olive' : 'default'}>
          {row.isCurrent ? 'Active Calendar' : 'Archived'}
        </Badge>
      ),
    },
    {
      header: 'Configured Semesters',
      accessor: 'semesters',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.semesters?.map((sem) => (
            <span key={sem.id} className="text-[10px] font-semibold bg-olive-50 text-olive-800 px-2 py-0.5 rounded border border-olive-200">
              {sem.name}
            </span>
          ))}
          <button
            onClick={() => {
              setSelectedYear(row);
              setSemForm({ name: '', startDate: row.startDate, endDate: row.endDate, isCurrent: true });
              setIsAddSemOpen(true);
            }}
            className="text-[10px] font-medium text-olive-600 hover:text-olive-700 underline ml-1"
          >
            + Add Semester
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Academic Years & Semesters</h2>
          <p className="text-xs text-muted">Configure institutional session dates and reporting semesters</p>
        </div>
        <button
          onClick={() => {
            setYearForm({ name: '', startDate: '2026-08-15', endDate: '2027-06-15', isCurrent: true });
            setIsAddYearOpen(true);
          }}
          className="btn-primary text-xs shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Year</span>
        </button>
      </div>

      <DataTable columns={columns} data={years} isLoading={loading} searchPlaceholder="Search academic years..." />

      {/* Add Year Modal */}
      <Modal isOpen={isAddYearOpen} onClose={() => setIsAddYearOpen(false)} title="Create Academic Year">
        <form onSubmit={handleCreateYear} className="space-y-4">
          <FormInput
            label="Academic Year Label"
            required
            value={yearForm.name}
            onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
            placeholder="e.g. 2026-2027"
          />
          <FormInput
            label="Start Date"
            type="date"
            required
            value={yearForm.startDate}
            onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
          />
          <FormInput
            label="End Date"
            type="date"
            required
            value={yearForm.endDate}
            onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
          />
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddYearOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Save Year'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Semester Modal */}
      <Modal isOpen={isAddSemOpen} onClose={() => setIsAddSemOpen(false)} title={`Add Semester to ${selectedYear?.name}`}>
        <form onSubmit={handleCreateSem} className="space-y-4">
          <FormInput
            label="Semester Name"
            required
            value={semForm.name}
            onChange={(e) => setSemForm({ ...semForm, name: e.target.value })}
            placeholder="e.g. Fall 2026"
          />
          <FormInput
            label="Start Date"
            type="date"
            required
            value={semForm.startDate}
            onChange={(e) => setSemForm({ ...semForm, startDate: e.target.value })}
          />
          <FormInput
            label="End Date"
            type="date"
            required
            value={semForm.endDate}
            onChange={(e) => setSemForm({ ...semForm, endDate: e.target.value })}
          />
          <div className="pt-4 border-t border-warmgrey flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsAddSemOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating...' : 'Save Semester'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicYearManagement;
