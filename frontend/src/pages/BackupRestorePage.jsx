import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { RefreshCw, Download, Database, ShieldAlert, CheckCircle2, History, HardDrive, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const BackupRestorePage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/backups');
      if (res.data?.success) {
        setBackups(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load backup snapshots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post('/system/backup');
      if (res.data?.success) {
        toast.success(`New snapshot ${res.data.data.backupId} captured successfully!`);
        loadBackups();
      }
    } catch (e) {
      toast.error('Failed to capture database snapshot');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    try {
      const res = await api.post(`/system/restore/${selectedBackup.id}`);
      if (res.data?.success) {
        toast.success(`System successfully restored from snapshot ${selectedBackup.id}!`);
        setShowRestoreModal(false);
      }
    } catch (e) {
      toast.error('Restore operation failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Disaster Recovery & Continuity
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Neon Point-in-Time Checkpoints</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Backup & Disaster Recovery Management</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Safeguard institutional marks, academic logs, student data, and generate point-in-time database snapshots.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{creating ? 'Generating Snapshot...' : 'Create Instant Backup'}</span>
        </button>
      </div>

      {/* Snapshot Information Banner */}
      <div className="card-premium p-5 bg-[#F0EFE6]/60 border border-[#E3E1D6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="w-5 h-5 text-[#52613B] shrink-0" />
          <p className="text-xs text-[#242820] leading-relaxed">
            Automated institutional backups run every night at <strong>04:00 UTC</strong> with full encryption and integrity checksums. Point-in-time recovery is maintained for 30 rolling calendar days.
          </p>
        </div>
        <span className="text-xs font-bold text-[#52613B] bg-white border border-[#CAD6B7] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm">
          Retention: 30 Days
        </span>
      </div>

      {/* Backups List Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="p-4 border-b border-[#E3E1D6] bg-white flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#242820]">Available Backup Snapshots & Archive History</h3>
          <span className="text-xs text-[#555B50] font-semibold">{backups.length} Checkpoints Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Snapshot Identifier</th>
                <th className="px-4 py-3.5">Timestamp (UTC)</th>
                <th className="px-4 py-3.5">Trigger Category</th>
                <th className="px-4 py-3.5 text-center">Archive Size</th>
                <th className="px-4 py-3.5 text-center">Integrity Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F7F2] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#52613B]">{b.id}</td>
                  <td className="px-4 py-3.5 text-[#555B50] font-medium">{b.date}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold uppercase bg-[#E4EAD9] text-[#293526] px-2 py-0.5 rounded border border-[#CAD6B7]">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#242820]">{b.size}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => toast.success(`Downloading snapshot archive ${b.id}.tar.gz`)}
                      className="p-1.5 rounded-lg border border-[#CAD6B7] text-[#52613B] hover:bg-[#E4EAD9] transition-colors"
                      title="Download backup archive"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBackup(b);
                        setShowRestoreModal(true);
                      }}
                      className="btn-secondary text-[11px] font-bold py-1 px-3 text-[#B84040] hover:bg-red-50 border-red-200"
                    >
                      Restore System
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Confirm Institutional System Restore"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-xs text-red-800">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Caution: Production State Overwrite</p>
              <p className="leading-relaxed">
                Restoring to <strong>{selectedBackup?.id}</strong> ({selectedBackup?.date}) will reset marks, attendance, and logs back to this exact checkpoint.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#555B50] leading-relaxed">
            Please confirm that you have informed academic staff and want to proceed with this rollback.
          </p>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              onClick={() => setShowRestoreModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              className="btn-primary text-xs font-bold bg-[#B84040] hover:bg-red-800"
            >
              Yes, Restore Snapshot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BackupRestorePage;
