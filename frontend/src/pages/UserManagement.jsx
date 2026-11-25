import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { UserCheck, Plus, Search, Shield, KeyRound, UserX, RefreshCw, Users, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const ROLES = ['ALL', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'STUDENT'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', form);
      if (res.data?.success) {
        toast.success('User account created successfully');
        setShowAddModal(false);
        loadUsers();
        setForm({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          role: 'STUDENT'
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'ACTIVE' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user ${user.email}?`)) return;
    try {
      const res = await api.patch(`/users/${user.id}/toggle-status`);
      if (res.data?.success) {
        toast.success(`User ${user.email} status updated`);
        loadUsers();
      }
    } catch (e) {
      toast.error('Failed to change user status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await api.post(`/users/${selectedUser.id}/reset-password`, { newPassword });
      if (res.data?.success) {
        toast.success(`Password reset for ${selectedUser.email}`);
        setShowResetModal(false);
        setNewPassword('');
      }
    } catch (e) {
      toast.error('Failed to reset password');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Identity & Access Management
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Active Directory: {users.length} Users</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Institutional User Management</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Administer system user accounts, role permissions, authentication credentials, and access status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-premium p-4 bg-[#F0EFE6]/60 border border-[#E3E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-[#52613B] text-white shadow-sm'
                  : 'bg-white border border-[#CAD6B7] text-[#555B50] hover:text-[#242820]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#74796D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs font-semibold"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Full Name</th>
                <th className="px-4 py-3.5">Email Address</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#242820] flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#E4EAD9] text-[#293526] font-bold flex items-center justify-center text-[11px] border border-[#CAD6B7]">
                        {u.fullName?.charAt(0) || 'U'}
                      </div>
                      <span>{u.fullName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] font-mono">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-[#52613B] text-white' :
                        u.role === 'TEACHER' ? 'bg-[#CAD6B7] text-[#242820]' :
                        u.role === 'STUDENT' ? 'bg-[#E4EAD9] text-[#293526]' :
                        'bg-[#F0EFE6] text-[#555B50]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] font-medium">{u.phone || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={u.status === 'ACTIVE' ? 'olive' : 'error'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowResetModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#CAD6B7] text-[#52613B] hover:bg-[#E4EAD9] transition-colors"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'border-[#B84040]/30 text-[#B84040] hover:bg-red-50'
                            : 'border-[#52613B]/30 text-[#52613B] hover:bg-emerald-50'
                        }`}
                        title={u.status === 'ACTIVE' ? "Suspend user" : "Activate user"}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Institutional User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Full Legal Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="e.g. Alexander Hamilton"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="name@oakridge.edu"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">System Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
                <option value="PARENT">PARENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password: ${selectedUser?.email}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-[#555B50] leading-relaxed">
            Specify a new security credential for <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email}). The user will immediately be able to sign in with this new password.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-xs font-semibold"
              placeholder="Enter at least 6 characters"
              required
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
