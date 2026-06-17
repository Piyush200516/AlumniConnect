import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, User, ShieldX } from 'lucide-react';
import { useAuthContext } from '../layout/AuthProvider';

export default function SettingsView() {
  const { profile, loading } = useAuthContext();

  if (loading || !profile) {
    return (
      <div className="animate-pulse space-y-6 rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-slate-900 rounded animate-pulse" />
            </div>
          ))}
        </div>
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
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="h-6 w-6 text-blue-400" /> Account Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Review your account settings and student verification status.
          </p>
        </div>

        <div className="border-t border-slate-800/60 pt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.fullName}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment Number</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.enrollmentNumber}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Email</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.email}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Status</span>
              <div className="mt-1.5 flex items-center justify-between px-4 py-2 rounded-xl border border-slate-800/80 bg-slate-900/20 h-[42px]">
                <span className="text-sm font-semibold text-slate-200">
                  {profile.verificationStatus === 'VERIFIED' ? 'Verified Student' : profile.verificationStatus === 'REJECTED' ? 'Rejected' : 'Under Verification'}
                </span>
                {profile.verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : profile.verificationStatus === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                    <ShieldX className="w-3.5 h-3.5" /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" /> Under Verification
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.course}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.branch}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</span>
              <span className="text-sm font-semibold text-slate-200 mt-1.5 block px-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/20">
                {profile.graduationYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
