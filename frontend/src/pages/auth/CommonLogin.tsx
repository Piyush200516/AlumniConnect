import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentLoginSchema } from '../../types/auth';
import type { StudentLogin as StudentLoginData } from '../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi2';
import { getApiUrl } from '../../services/api';

/* ------------------------------------------------------------------ */
/*  Floating particle dots for atmosphere                              */
/* ------------------------------------------------------------------ */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 6,
}));

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export const CommonLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Login | AlumniConnect';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentLoginData>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginData) => {
    setLoading(true);
    await login(undefined, data);
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/google');
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl('/auth/github');
  };

  return (
    <div
      className="common-login-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, #0d1b3e 0%, #060a12 40%, #0a0612 70%, #060a12 100%)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Ambient Glow Orbs ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'orb-drift 14s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'orb-drift 18s ease-in-out infinite alternate-reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '60%',
        width: '30%', height: '30%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
        animation: 'orb-drift 22s ease-in-out infinite alternate',
      }} />

      {/* ── Particle Dots ── */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'rgba(148,163,184,0.25)',
            pointerEvents: 'none',
            animation: `particle-float ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* ── Grid Mesh overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── Glass Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* ── Top accent bar ── */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '24px 24px 0 0',
        }} />

        <div style={{ padding: '2.25rem 2.5rem 2.5rem' }}>

          {/* ── Brand Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            {/* Logo mark */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                marginBottom: '1rem',
                boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
              }}
            >
              <HiAcademicCap size={30} color="#fff" />
            </motion.div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 0.375rem',
              lineHeight: 1.2,
            }}>
              AlumniConnect
            </h1>
            <p style={{
              color: 'rgba(148,163,184,0.8)',
              fontSize: '0.875rem',
              margin: 0,
              fontWeight: 400,
            }}>
              Welcome back — sign in to your portal
            </p>
          </motion.div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* OAuth Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}
            >
              <OAuthButton
                icon={<FcGoogle size={19} />}
                label="Google"
                onClick={handleGoogleLogin}
              />
              <OAuthButton
                icon={<FaGithub size={17} color="#e2e8f0" />}
                label="GitHub"
                onClick={handleGithubLogin}
              />
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: 'rgba(100,116,139,0.9)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                or continue with email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 }}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
              style={{ position: 'relative' }}
            >
              {activeField === 'email' && (
                <motion.div
                  layoutId="field-glow"
                  style={{
                    position: 'absolute', inset: '-2px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))',
                    zIndex: 0, pointerEvents: 'none',
                  }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@college.edu"
                  register={register}
                  error={errors.email}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.37 }}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
              style={{ position: 'relative' }}
            >
              {activeField === 'password' && (
                <motion.div
                  layoutId="field-glow"
                  style={{
                    position: 'absolute', inset: '-2px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))',
                    zIndex: 0, pointerEvents: 'none',
                  }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <PasswordField
                  label="Password"
                  name="password"
                  register={register}
                  error={errors.password}
                />
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1.5rem' }}
            >
              <Link
                to="/auth/student/forgot-password"
                style={{
                  fontSize: '0.78rem', color: 'rgba(96,165,250,0.9)',
                  textDecoration: 'none', fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(96,165,250,0.9)')}
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.015, boxShadow: '0 12px 40px rgba(59,130,246,0.45)' } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: loading
                    ? 'rgba(59,130,246,0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                  backgroundSize: '200% 100%',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                  transition: 'background 0.3s, box-shadow 0.3s',
                  outline: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shimmer */}
                {!loading && (
                  <div style={{
                    position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                    animation: 'btn-shimmer 3s infinite',
                    borderRadius: '14px',
                  }} />
                )}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LoadingSpinner />
                    </motion.span>
                  ) : (
                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* ── Footer ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52 }}
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.375rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'rgba(100,116,139,0.8)', marginBottom: '0.625rem' }}>
              Don't have an account?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <FooterLink to="/auth/student/signup" label="Register as Student" />
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.12)' }} />
              <FooterLink to="/auth/alumni/signup" label="Register as Alumni" />
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes orb-drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3%, 5%) scale(1.08); }
        }

        @keyframes particle-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          100% { transform: translateY(-18px) translateX(8px); opacity: 0.5; }
        }

        @keyframes btn-shimmer {
          0%   { left: -100%; }
          60%  { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Helper sub-components                                               */
/* ------------------------------------------------------------------ */

interface OAuthBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const OAuthButton = ({ icon, label, onClick }: OAuthBtnProps) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.1)' }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.7rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      color: '#e2e8f0',
      fontWeight: 600,
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'border-color 0.2s, background 0.2s',
      outline: 'none',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
  >
    {icon}
    {label}
  </motion.button>
);

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink = ({ to, label }: FooterLinkProps) => (
  <Link
    to={to}
    style={{
      fontSize: '0.8rem',
      color: '#60a5fa',
      textDecoration: 'none',
      fontWeight: 600,
      transition: 'color 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
    onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}
  >
    {label}
  </Link>
);
