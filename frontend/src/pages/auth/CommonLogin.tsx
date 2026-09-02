import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentLoginSchema } from '../../types/auth';
import type { StudentLogin as StudentLoginData } from '../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { getApiUrl } from '../../services/api';

export const CommonLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            AlumniConnect
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to access your portal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all duration-200 cursor-pointer active:scale-98"
            >
              <FcGoogle size={20} />
              Google
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all duration-200 cursor-pointer active:scale-98"
            >
              <FaGithub size={18} className="text-white" />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
              or use email
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@college.edu"
              register={register}
              error={errors.email}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <PasswordField
              label="Password"
              name="password"
              register={register}
              error={errors.password}
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/auth/student/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-250 cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-98"
          >
            {loading ? <LoadingSpinner /> : 'Sign In'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
          <p className="text-xs text-gray-400">
            Don't have an account?
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a
              href="https://alumniconnect-7ag.pages.dev/auth/student/signup"
              className="text-blue-400 hover:underline font-semibold"
            >
              Register as Student
            </a>
            <span className="text-gray-600">|</span>
            <Link
              to="/auth/alumni/signup"
              className="text-blue-400 hover:underline font-semibold"
            >
              Register as Alumni
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
