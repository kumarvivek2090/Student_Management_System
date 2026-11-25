import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { History, Shield, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs');
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load system activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesSearch =
      l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Security Audit Trail
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Immutable Event Log</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">System Activity & Audit Logs</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Trace administrative updates, authentication events, marks publication, and database modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="btn-secondary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#52613B] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 bg-[#F0EFE6]/60 border border-[#E3E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['ALL', 'INFO', 'WARN', 'CRITICAL'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                severityFilter === s
                  ? 'bg-[#52613B] text-white shadow-sm'
                  : 'bg-white border border-[#CAD6B7] text-[#555B50] hover:text-[#242820]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#74796D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs font-semibold"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-premium overflow-hidden border border-[#E3E1D6]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E1D6] text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#555B50] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">User / Operator</th>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Operation Details</th>
                <th className="px-4 py-3.5 text-center">IP Address</th>
                <th className="px-4 py-3.5 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1D6] bg-white">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#555B50] whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#242820]">{log.userEmail || 'System Core'}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#555B50] max-w-md">{log.details}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-[11px] text-[#74796D]">{log.ipAddress}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={log.severity === 'CRITICAL' ? 'error' : log.severity === 'WARN' ? 'gold' : 'olive'}>
                        {log.severity}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#74796D] font-medium">
                    No activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
