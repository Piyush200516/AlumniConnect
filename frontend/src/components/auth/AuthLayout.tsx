import { motion } from 'framer-motion';
import React from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Sparkles } from 'lucide-react';

export type AuthAccentColor = 'blue' | 'purple' | 'emerald';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor?: AuthAccentColor;
  icon?: ComponentType<{ className?: string }>;
  heroTitle?: string;
  heroSubtitle?: string;
  stats?: { label: string; value: string }[];
  children: ReactNode;
  footerContent?: ReactNode;
}

const colorStyles: Record<
  AuthAccentColor,
  {
    bgOrb1: string;
    bgOrb2: string;
    badgeBg: string;
    badgeText: string;
    borderGlow: string;
    topAccent: string;
    iconBg: string;
    heroGlow: string;
  }
> = {
  blue: {
    bgOrb1: 'rgba(59, 130, 246, 0.18)',
    bgOrb2: 'rgba(6, 182, 212, 0.12)',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    badgeText: 'text-blue-400',
    borderGlow: 'rgba(59, 130, 246, 0.25)',
    topAccent: 'linear-gradient(90deg, #3b82f6, #06b6d4, #6366f1)',
    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    heroGlow: 'from-blue-600/20 via-indigo-600/10 to-transparent',
  },
  purple: {
    bgOrb1: 'rgba(139, 92, 246, 0.18)',
    bgOrb2: 'rgba(236, 72, 153, 0.12)',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    badgeText: 'text-purple-300',
    borderGlow: 'rgba(139, 92, 246, 0.25)',
    topAccent: 'linear-gradient(90deg, #8b5cf6, #ec4899, #6366f1)',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    heroGlow: 'from-purple-600/20 via-pink-600/10 to-transparent',
  },
  emerald: {
    bgOrb1: 'rgba(16, 185, 129, 0.18)',
    bgOrb2: 'rgba(20, 184, 166, 0.12)',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    borderGlow: 'rgba(16, 185, 129, 0.25)',
    topAccent: 'linear-gradient(90deg, #10b981, #14b8a6, #3b82f6)',
    iconBg: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    heroGlow: 'from-emerald-600/20 via-teal-600/10 to-transparent',
  },
};

const defaultStats = [
  { label: 'Active Alumni', value: '10,000+' },
  { label: 'Career Opportunities', value: '2,500+' },
  { label: 'Mentorship Sessions', value: '5,000+' },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  badgeText,
  accentColor = 'blue',
  icon: HeaderIcon = GraduationCap,
  heroTitle = 'Empowering Academic & Career Journeys',
  heroSubtitle = 'Connect with peers, alumni mentors, and institutional placement networks in one intelligent portal.',
  stats = defaultStats,
  children,
  footerContent,
}) => {
  const theme = colorStyles[accentColor];

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#060a12] text-slate-100 p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* ── Ambient Radial Lighting Orbs ── */}
      <div
        className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{ background: theme.bgOrb1 }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{ background: theme.bgOrb2 }}
      />

      {/* ── Grid Mesh Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Navigation Top Bar ── */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20 flex items-center gap-4">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-lg backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch Role</span>
        </Link>
      </div>

      {/* ── Main Container Glass Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl my-auto bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Top Accent Strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-30"
          style={{ background: theme.topAccent }}
        />

        {/* ── Left Hero Panel (Desktop) ── */}
        <div className={`hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 relative overflow-hidden bg-gradient-to-b ${theme.heroGlow} border-r border-white/5`}>
          {/* Subtle Graphic Accents */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-white mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AlumniConnect Portal</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight mb-4">
              {heroTitle}
            </h2>

            <p className="text-slate-300/80 text-sm leading-relaxed mb-8">
              {heroSubtitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Platform Highlights
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {stats.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <span className="text-xs font-medium text-slate-300">{st.label}</span>
                  <span className="text-sm font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Corner Glow */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ── Right Form Panel ── */}
        <div className="lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative z-10">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white"
                  style={{ background: theme.iconBg }}
                >
                  <HeaderIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-400 block">
                    AlumniConnect
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {title}
                  </h1>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider uppercase ${theme.badgeBg} ${theme.badgeText}`}
              >
                {badgeText}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              {subtitle}
            </p>

            {/* Form Content */}
            <div>{children}</div>
          </div>

          {/* Footer Area */}
          {footerContent && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              {footerContent}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
