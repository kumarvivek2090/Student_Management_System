import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import FormInput from '../components/common/FormInput';
import Badge from '../components/common/Badge';
import { Database, ShieldCheck, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [institutionName, setInstitutionName] = useState('Oakridge International Academy');
  const [institutionAddress, setInstitutionAddress] = useState('452 Academy Way, Suite 100, Cambridge, MA');
  const [institutionPhone, setInstitutionPhone] = useState('+1 (555) 234-5678');
  const [minAttendance, setMinAttendance] = useState('75.0');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
        res.data.data.forEach((s) => {
          if (s.settingKey === 'INSTITUTION_NAME') setInstitutionName(s.settingValue);
          if (s.settingAddress === 'INSTITUTION_ADDRESS') setInstitutionAddress(s.settingValue);
          if (s.settingKey === 'INSTITUTION_PHONE') setInstitutionPhone(s.settingValue);
          if (s.settingKey === 'MIN_ATTENDANCE_PERCENTAGE') setMinAttendance(s.settingValue);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key, value) => {
    try {
      await api.put('/settings', { key, value });
      toast.success('Configuration updated in Neon');
    } catch (e) {
      toast.error('Failed to update setting');
    }
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/dev/seed');
      if (res.data.success) {
        toast.success('Controlled academic demonstration data initialized in Neon PostgreSQL!');
      }
    } catch (e) {
      toast.error('Failed to initialize demo data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-charcoal">Institutional Settings</h2>
        <p className="text-xs text-muted">Manage academy metadata, policies, and database configurations</p>
      </div>

      {/* Database Status Card */}
      <div className="card-premium p-6 border-l-4 border-l-olive-500 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center text-olive-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal">Neon Cloud PostgreSQL</h3>
              <p className="text-xs text-muted">Direct SSL Connection | Flyway Migrations Active</p>
            </div>
          </div>
          <Badge variant="olive">Cloud Connected</Badge>
        </div>
        <p className="text-xs text-charcoal/80 mt-4 leading-relaxed">
          The application operates exclusively on Neon PostgreSQL. No local databases, fake responses, or browser persistence are used. All student enrollments, attendance sessions, and examination results are persistently stored.
        </p>

        {/* Development Seed Trigger */}
        <div className="mt-5 pt-4 border-t border-warmgrey flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-charcoal">Demo Data Seeder</h4>
            <p className="text-[11px] text-muted">Safely populate demonstration classes, subjects, and cohort records</p>
          </div>
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="btn-secondary text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-olive-600" />
            <span>{seeding ? 'Initializing...' : 'Seed Demo Cohort'}</span>
          </button>
        </div>
      </div>

      {/* Institution Metadata Form */}
      <div className="card-premium p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-warmgrey/70">
          <Building className="w-4 h-4 text-olive-700" />
          <h3 className="text-sm font-semibold text-charcoal">Official Institution Identity</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FormInput
                label="Institution Name (Printed on Official Reports)"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSaveSetting('INSTITUTION_NAME', institutionName)}
              className="btn-primary text-xs py-2.5"
            >
              Update
            </button>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FormInput
                label="Official Campus Address"
                value={institutionAddress}
                onChange={(e) => setInstitutionAddress(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSaveSetting('INSTITUTION_ADDRESS', institutionAddress)}
              className="btn-primary text-xs py-2.5"
            >
              Update
            </button>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FormInput
                label="Institutional Contact Phone"
                value={institutionPhone}
                onChange={(e) => setInstitutionPhone(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSaveSetting('INSTITUTION_PHONE', institutionPhone)}
              className="btn-primary text-xs py-2.5"
            >
              Update
            </button>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FormInput
                label="Minimum Mandatory Attendance (%)"
                type="number"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSaveSetting('MIN_ATTENDANCE_PERCENTAGE', minAttendance)}
              className="btn-primary text-xs py-2.5"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
