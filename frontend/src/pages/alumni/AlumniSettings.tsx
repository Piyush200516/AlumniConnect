import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, ShieldAlert, Eye, EyeOff, RefreshCw, User, Bell, Lock } from 'lucide-react';
import { useAuthContext, type AlumniProfile } from '../../components/layout/AuthProvider';
import api from '../../services/api';
import { toastError, toastSuccess } from '../../utils/toast';

type PrivacySetting = AlumniProfile['privacySetting'];

export default function AlumniSettings() {
  const { alumniProfile, loading, refreshAlumniProfile } = useAuthContext();
  const [privacySetting, setPrivacySetting] = useState<PrivacySetting>('PUBLIC');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (alumniProfile?.privacySetting) {
      setPrivacySetting(alumniProfile.privacySetting);
    }
  }, [alumniProfile?.privacySetting]);

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await api.patch('/mentorship/alumni-privacy', { privacySetting });
      toastSuccess('Privacy settings updated successfully');
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!alumniProfile) {
    return (
      <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl text-center space-y-4">
        <p className="text-slate-400 font-medium">Unable to load settings.</p>
        <button
          onClick={refreshAlumniProfile}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="h-6 w-6 text-blue-400" /> Account Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Control your alumni visibility and account preferences.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/25 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Profile Privacy</h3>
            </div>
            <p className="text-sm text-slate-400">
              Choose who can see your alumni profile in the directory and mentorship areas.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {([
                {
                  value: 'PUBLIC',
                  title: 'Public',
                  description: 'Visible to everyone',
                  icon: Eye,
                },
                {
                  value: 'PRIVATE',
                  title: 'Private',
                  description: 'Visible to logged-in users',
                  icon: ShieldCheck,
                },
                {
                  value: 'HIDDEN',
                  title: 'Hidden',
                  description: 'Not shown in directory',
                  icon: EyeOff,
                },
              ] as const).map((option) => {
                const Icon = option.icon;
                const active = privacySetting === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacySetting(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-blue-500/30 bg-blue-500/10 text-white shadow-lg shadow-blue-500/10'
                        : 'border-slate-800/60 bg-slate-950/35 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4.5 w-4.5 ${active ? 'text-blue-300' : 'text-slate-500'}`} />
                      <span className="text-sm font-semibold">{option.title}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">{option.description}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSavePrivacy}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Save Privacy
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/25 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Account Summary</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="Email" value={alumniProfile.email} />
              <InfoCard label="Batch" value={String(alumniProfile.passingYear)} />
              <InfoCard label="Company" value={alumniProfile.currentCompany || 'Not added'} />
              <InfoCard label="Role" value={alumniProfile.designation || 'Alumni'} />
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/35 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Current Privacy Mode</p>
              <p className="mt-1 text-sm font-semibold text-white">{privacySetting}</p>
              <p className="mt-2 text-xs text-slate-500">
                You can change this at any time. The profile page reflects the current setting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/35 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-200 break-words">{value}</p>
    </div>
  );
}
