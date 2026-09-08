import { motion } from 'framer-motion';
import type { Role } from '../../types/user';
import { RoleCard } from './RoleCard';
import { GraduationCap, Award, Building2, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 5,
}));

const RoleSelection = () => {
  const cards = [
    {
      role: 'student' as Role,
      title: 'Student',
      badge: 'Learner Portal',
      description: 'Access student dashboard, mentorship programs, campus placement events, and job referrals.',
      loginPath: '/auth/student/login',
      signupPath: '/auth/student/signup',
      icon: GraduationCap,
      accentColor: 'blue' as const,
    },
    {
      role: 'alumni' as Role,
      title: 'Alumni',
      badge: 'Mentor Portal',
      description: 'Network with fellow graduates, offer student mentorship, post internal job referrals, and stay engaged.',
      loginPath: '/auth/alumni/login',
      signupPath: '/auth/alumni/signup',
      icon: Award,
      accentColor: 'purple' as const,
    },
    {
      role: 'cdc' as Role,
      title: 'CDC Official',
      badge: 'Admin Portal',
      description: 'Manage placement drives, track alumni engagement metrics, organize events, and broadcast updates.',
      loginPath: '/auth/cdc/login',
      icon: Building2,
      accentColor: 'emerald' as const,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a12] text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans my-auto py-12">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-purple-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      {/* Particle Atmosphere */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-slate-400/20 pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `particle-float ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Grid Mesh Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-5xl relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AlumniConnect Gateway
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Choose Your Portal
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            Select your institution role to sign in or create a new account to join the AlumniConnect platform.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md backdrop-blur-md"
          >
            <LogIn className="w-4 h-4 text-blue-400" />
            <span>Or go to Unified Portal Login</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
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

      <style>{`
        @keyframes particle-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.15; }
          100% { transform: translateY(-20px) translateX(10px); opacity: 0.45; }
        }
      `}</style>
    </div>
  );
};

export default RoleSelection;
