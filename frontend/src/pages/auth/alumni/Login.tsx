import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alumniLoginSchema } from '../../../types/auth';
import type { AlumniLogin as AlumniLoginData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Award, Mail, Lock, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../../services/api';

export const AlumniLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Alumni Portal Sign In | AlumniConnect';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlumniLoginData>({
    resolver: zodResolver(alumniLoginSchema),
  });

  const onSubmit = async (data: AlumniLoginData) => {
    setLoading(true);
    await login('alumni', data, '/auth/alumni/login', '/alumni/dashboard');
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/alumni/google');
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl('/auth/alumni/github');
  };

  return (
    <AuthLayout
      title="Alumni Portal"
      subtitle="Welcome back! Connect with fellow graduates, offer student mentorship, and share career opportunities."
      badgeText="Mentor Portal"
      accentColor="purple"
      icon={Award}
      heroTitle="Give Back & Expand Your Global Professional Network"
      heroSubtitle="Engage in meaningful student mentorship, post internal job referrals, and stay connected with your alma mater."
      stats={[
        { label: 'Registered Alumni', value: '10,000+' },
        { label: 'Companies Represented', value: '850+' },
        { label: 'Referral Opportunities', value: '2,200+' },
      ]}
      footerContent={
        <p className="text-xs text-slate-400">
          New alumni?{' '}
          <Link
            to="/auth/alumni/signup"
            className="text-purple-400 font-bold underline hover:text-purple-300 transition-colors"
          >
            Register as Alumni Mentor
          </Link>
        </p>
      }
    >
      {/* SSO Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md cursor-pointer"
        >
          <FcGoogle size={18} />
          <span>Google SSO</span>
        </button>

        <button
          type="button"
          onClick={handleGithubLogin}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md cursor-pointer"
        >
          <FaGithub size={18} />
          <span>GitHub SSO</span>
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

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@domain.com"
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

        <div className="flex justify-end mb-6">
          <Link
            to="/auth/alumni/forgot-password"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 border border-white/10 shadow-xl shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
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
                <span>Sign In as Alumni</span>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </AuthLayout>
  );
};
