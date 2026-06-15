import { motion } from 'framer-motion';
import { Camera, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    fullName: string;
    course: string;
    branch: string;
    graduationYear: number;
    profileImage: string | null;
    isVerified: boolean;
  };
  completionPercentage: number;
  onEditClick: () => void;
}

export default function ProfileHeader({ profile, completionPercentage, onEditClick }: ProfileHeaderProps) {
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    profile.fullName || 'Student'
  )}&backgroundColor=0d1e3a&textColor=ffffff`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl border border-slate-800/60 bg-slate-950/45 p-6 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar Section */}
        <div className="relative group cursor-pointer" onClick={onEditClick}>
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-slate-800/80 group-hover:border-blue-500/50 shadow-lg shadow-black/40 transition-all duration-300">
            <img
              src={profile.profileImage || defaultAvatar}
              alt={profile.fullName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {profile.fullName || 'Complete Your Profile'}
            </h1>
            <div className="flex justify-center md:justify-start">
              {profile.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" /> Under Verification
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-400 text-sm font-medium">
            {profile.course} in {profile.branch} • Class of {profile.graduationYear}
          </p>

          {/* Completeness Bar */}
          <div className="max-w-md space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Profile Completeness</span>
              <span className="text-blue-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEditClick}
          className="md:self-start px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          Edit Profile
        </button>
      </div>
    </motion.div>
  );
}
