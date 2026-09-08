import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentLoginSchema } from '../../../types/auth';
import type { StudentLogin as StudentLoginData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../../services/api';

export const StudentLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Student Portal Sign In | AlumniConnect';
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
    await login('student', data, '/auth/student/login', '/student/dashboard');
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/student/google');
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl('/auth/student/github');
  };

  return (
    <AuthLayout
      title="Student Portal"
      subtitle="Sign in with your college credentials to access your dashboard, mentorship requests, and placement resources."
      badgeText="Student Portal"
      accentColor="blue"
      icon={GraduationCap}
      heroTitle="Accelerate Your Career with Alumni Mentors"
      heroSubtitle="Unlock 1-on-1 mentorship sessions, direct job referral opportunities, and campus placement drives."
      stats={[
        { label: 'Active Mentors', value: '3,200+' },
        { label: 'Campus Job Posts', value: '1,400+' },
        { label: 'Mentorship Rating', value: '4.9 / 5' },
      ]}
      footerContent={
        <p className="text-xs text-slate-400">
          New student?{' '}
          <Link
            to="/auth/student/signup"
            className="text-blue-400 font-bold underline hover:text-blue-300 transition-colors"
          >
            Create a Student Account
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
          label="College Email"
          name="email"
          type="email"
          placeholder="you@college.edu"
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
            to="/auth/student/forgot-password"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-white/10 shadow-xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
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
                <span>Sign In as Student</span>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </AuthLayout>
  );
};
