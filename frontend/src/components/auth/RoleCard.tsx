import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Role } from '../../types/user';
import type { ComponentType } from 'react';
import { ArrowRight } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  title: string;
  badge: string;
  description: string;
  loginPath: string;
  signupPath?: string;
  icon: ComponentType<{ className?: string }>;
  accentColor: 'blue' | 'purple' | 'emerald';
}

export const RoleCard = ({
  title,
  badge,
  description,
  loginPath,
  signupPath,
  icon: Icon,
  accentColor,
}: RoleCardProps) => {
  const accentClasses = {
    blue: {
      badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
      btn: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25 text-white',
      link: 'text-blue-400 hover:text-blue-300',
      glow: 'hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]',
    },
    purple: {
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
      btn: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25 text-white',
      link: 'text-purple-400 hover:text-purple-300',
      glow: 'hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]',
    },
    emerald: {
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25 text-white',
      link: 'text-emerald-400 hover:text-emerald-300',
      glow: 'hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]',
    },
  }[accentColor];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group bg-slate-900/60 backdrop-blur-2xl border border-white/10 ${accentClasses.glow} rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300`}
    >
      {/* Top Accent Lighting */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300 ${accentClasses.iconBg}`}>
            <Icon className="w-7 h-7" />
          </div>
          <span className={`px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md ${accentClasses.badgeBg}`}>
            {badge}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
          {title}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="space-y-3 pt-5 border-t border-white/10">
        <Link
          to={loginPath}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer ${accentClasses.btn}`}
        >
          <span>Sign In as {title}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {signupPath ? (
          <Link
            to={signupPath}
            className={`w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs text-center block transition-all ${accentClasses.link}`}
          >
            New user? <span className="underline font-bold">Register as {title}</span>
          </Link>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/5 text-slate-500 font-medium text-xs text-center">
            Admin Controlled Access
          </div>
        )}
      </div>
    </motion.div>
  );
};
