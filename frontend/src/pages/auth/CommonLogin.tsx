import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentLoginSchema, alumniLoginSchema, cdcLoginSchema } from '../../types/auth';
import type { StudentLogin as StudentLoginData } from '../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi2';
import { GraduationCap, Award, Building2, Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { getApiUrl } from '../../services/api';
import type { Role } from '../../types/user';

type RoleTab = 'student' | 'alumni' | 'cdc';

const tabConfig: Record<
  RoleTab,
  {
    label: string;
    badge: string;
    icon: any;
    accent: string;
    btnGradient: string;
    glowOrb: string;
    redirect: string;
    googleEndpoint: string;
    githubEndpoint: string;
    forgotPassPath: string;
    signupPath?: string;
  }
> = {
  student: {
    label: 'Student',
    badge: 'Learner Portal',
    icon: GraduationCap,
    accent: '#3b82f6',
    btnGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #06b6d4 100%)',
    glowOrb: 'rgba(59, 130, 246, 0.25)',
    redirect: '/student/dashboard',
    googleEndpoint: '/auth/student/google',
    githubEndpoint: '/auth/student/github',
    forgotPassPath: '/auth/student/forgot-password',
    signupPath: '/auth/student/signup',
  },
  alumni: {
    label: 'Alumni',
    badge: 'Mentor Portal',
    icon: Award,
    accent: '#8b5cf6',
    btnGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #ec4899 100%)',
    glowOrb: 'rgba(139, 92, 246, 0.25)',
    redirect: '/alumni/dashboard',
    googleEndpoint: '/auth/alumni/google',
    githubEndpoint: '/auth/alumni/github',
    forgotPassPath: '/auth/alumni/forgot-password',
    signupPath: '/auth/alumni/signup',
  },
  cdc: {
    label: 'CDC Official',
    badge: 'Admin Portal',
    icon: Building2,
    accent: '#10b981',
    btnGradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #14b8a6 100%)',
    glowOrb: 'rgba(16, 185, 129, 0.25)',
    redirect: '/cdc/dashboard',
    googleEndpoint: '/auth/cdc/google',
    githubEndpoint: '/auth/cdc/github',
    forgotPassPath: '/auth/student/forgot-password',
  },
};

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 5,
}));

export const CommonLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<RoleTab>('student');

  useEffect(() => {
    document.title = 'Login Gateway | AlumniConnect';
  }, []);

  const activeConfig = tabConfig[activeTab];

  // Pick validation schema based on tab
  const activeSchema =
    activeTab === 'student'
      ? studentLoginSchema
      : activeTab === 'alumni'
      ? alumniLoginSchema
      : cdcLoginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentLoginData>({
    resolver: zodResolver(activeSchema),
  });

  const handleTabSwitch = (tab: RoleTab) => {
    setActiveTab(tab);
    reset();
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    const loginEndpoint = `/auth/${activeTab}/login`;
    await login(activeTab as Role, data, loginEndpoint, activeConfig.redirect);
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl(activeConfig.googleEndpoint);
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl(activeConfig.githubEndpoint);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#060a12] text-slate-100 p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* ── Ambient Radial Lighting Orbs ── */}
      <div
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[150px] pointer-events-none transition-all duration-700"
        style={{ background: activeConfig.glowOrb }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full blur-[150px] pointer-events-none transition-all duration-700"
        style={{ background: 'rgba(99, 102, 241, 0.15)' }}
      />

      {/* ── Floating Atmosphere Particles ── */}
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

      {/* ── Grid Mesh Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Glass Card Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl my-auto bg-slate-900/75 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Top Gradient Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-30 transition-all duration-500"
          style={{ background: activeConfig.btnGradient }}
        />

        {/* ── Left Side Hero Banner (Desktop Split Screen) ── */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 relative overflow-hidden bg-gradient-to-b from-slate-800/40 via-slate-900/80 to-slate-950 border-r border-white/5">
          <div className="relative z-10">
            {/* Platform Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-white mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AlumniConnect Gateway</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl text-white transition-all duration-500"
                style={{ background: activeConfig.btnGradient }}
              >
                <HiAcademicCap size={34} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  AlumniConnect
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Institution Network Portal
                </p>
              </div>
            </div>

            <h3 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight mb-4">
              Bridge the Gap Between Campus & Career
            </h3>

            <p className="text-slate-300/80 text-sm leading-relaxed mb-8">
              Join thousands of students, alumni mentors, and CDC officials driving career growth, mentorship, and placements.
            </p>
          </div>

          {/* Dynamic Platform Statistics */}
          <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Real-time Impact
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-medium text-slate-300">Verified Alumni Network</span>
                <span className="text-sm font-extrabold text-blue-400">10,000+</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-medium text-slate-300">Mentorship Matches</span>
                <span className="text-sm font-extrabold text-purple-400">5,400+</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-medium text-slate-300">Placement Record Rate</span>
                <span className="text-sm font-extrabold text-emerald-400">98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Side Interactive Login Form Panel ── */}
        <div className="lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative z-10">
          <div>
            {/* Mobile Header / Brand */}
            <div className="lg:hidden text-center mb-6">
              <div
                className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-lg text-white mb-3"
                style={{ background: activeConfig.btnGradient }}
              >
                <HiAcademicCap size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                AlumniConnect
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Sign in to your portal
              </p>
            </div>

            {/* Role Switcher Tab Bar */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Select Your Portal Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                {(['student', 'alumni', 'cdc'] as RoleTab[]).map((tab) => {
                  const cfg = tabConfig[tab];
                  const IconComp = cfg.icon;
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleTabSwitch(tab)}
                      className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-tab-bg"
                          className="absolute inset-0 rounded-xl z-0 shadow-lg"
                          style={{ background: cfg.btnGradient }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span>{cfg.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portal Title Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeConfig.label} Sign In
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  Welcome back — enter your credentials to access your dashboard.
                </p>
              </div>
              <span
                className="hidden sm:inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border backdrop-blur-md"
                style={{
                  color: activeConfig.accent,
                  borderColor: `${activeConfig.accent}40`,
                  backgroundColor: `${activeConfig.accent}15`,
                }}
              >
                {activeConfig.badge}
              </span>
            </div>

            {/* SSO OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md cursor-pointer"
              >
                <FcGoogle size={18} />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md cursor-pointer"
              >
                <FaGithub size={18} />
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                label={
                  activeTab === 'student'
                    ? 'College Email'
                    : activeTab === 'alumni'
                    ? 'Email Address'
                    : 'Official CDC Email'
                }
                name="email"
                type="email"
                placeholder={
                  activeTab === 'student'
                    ? 'student@college.edu'
                    : activeTab === 'alumni'
                    ? 'alumni@domain.com'
                    : 'cdc@institution.gov'
                }
                icon={Mail}
                register={register}
                error={errors.email}
              />

              <PasswordField
                label="Password"
                name="password"
                icon={Lock}
                register={register}
                error={errors.password}
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end mb-6">
                <Link
                  to={activeConfig.forgotPassPath}
                  className="text-xs font-semibold hover:underline transition-colors"
                  style={{ color: activeConfig.accent }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white border border-white/10 shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                style={{
                  background: loading ? 'rgba(255,255,255,0.1)' : activeConfig.btnGradient,
                }}
              >
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[btn-shimmer_3s_infinite]" />
                )}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <LoadingSpinner />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span>Sign In to {activeConfig.label} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </div>

          {/* Footer Area */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            {activeConfig.signupPath ? (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <Link
                  to={activeConfig.signupPath}
                  className="font-bold underline hover:text-white transition-colors"
                  style={{ color: activeConfig.accent }}
                >
                  Register as {activeConfig.label}
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                CDC Official accounts are provisioned by system administrators.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes particle-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.15; }
          100% { transform: translateY(-20px) translateX(10px); opacity: 0.45; }
        }
        @keyframes btn-shimmer {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
