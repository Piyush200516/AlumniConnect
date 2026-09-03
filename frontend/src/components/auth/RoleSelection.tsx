import { motion } from 'framer-motion';
import type { Role } from '../../types/user';
import { RoleCard } from './RoleCard';
import { GraduationCap, Award, Building2, Sparkles } from 'lucide-react';

const RoleSelection = () => {
  const cards = [
    {
      role: 'student' as Role,
      title: 'Student',
      badge: 'Learner',
      description: 'Access student dashboard, mentorship programs, campus events, and career opportunities.',
      loginPath: '/auth/student/login',
      signupPath: '/auth/student/signup',
      icon: GraduationCap,
      accentColor: 'blue' as const,
    },
    {
      role: 'alumni' as Role,
      title: 'Alumni',
      badge: 'Mentor',
      description: 'Network with fellow graduates, offer student mentorship, post job referrals, and stay engaged.',
      loginPath: '/auth/alumni/login',
      signupPath: '/auth/alumni/signup',
      icon: Award,
      accentColor: 'purple' as const,
    },
    {
      role: 'cdc' as Role,
      title: 'CDC Official',
      badge: 'Admin',
      description: 'Manage placement drives, track alumni engagement, manage events, and broadcast announcements.',
      loginPath: '/auth/cdc/login',
      icon: Building2,
      accentColor: 'emerald' as const,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] p-4 relative overflow-hidden my-auto py-12">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AlumniConnect Gateway
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            Choose Your Portal
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Select your role to sign in or create a new account to join the AlumniConnect platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6 grid-cols-1 md:grid-cols-3"
        >
          {cards.map((c) => (
            <RoleCard
              key={c.role}
              role={c.role}
              title={c.title}
              badge={c.badge}
              description={c.description}
              loginPath={c.loginPath}
              signupPath={c.signupPath}
              icon={c.icon}
              accentColor={c.accentColor}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;

