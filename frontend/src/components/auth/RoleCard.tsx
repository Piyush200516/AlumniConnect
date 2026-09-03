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
      badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 text-white',
      link: 'text-blue-400 hover:text-blue-300',
      glow: 'group-hover:border-blue-500/40',
    },
    purple: {
      badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
      btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 text-white',
      link: 'text-purple-400 hover:text-purple-300',
      glow: 'group-hover:border-purple-500/40',
    },
    emerald: {
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 text-white',
      link: 'text-emerald-400 hover:text-emerald-300',
      glow: 'group-hover:border-emerald-500/40',
    },
  }[accentColor];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group bg-white/5 backdrop-blur-2xl border border-white/10 ${accentClasses.glow} rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
          <span className={`px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase ${accentClasses.badgeBg}`}>
            {badge}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/10">
        <Link
          to={loginPath}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer ${accentClasses.btn}`}
        >
          <span>Sign In to Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {signupPath && (
          <Link
            to={signupPath}
            className={`w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs text-center block transition-all ${accentClasses.link}`}
          >
            New here? <span className="underline font-semibold">Register as {title}</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

