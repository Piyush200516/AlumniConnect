import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cdcLoginSchema } from '../../../types/auth';
import type { CdcLogin as CdcLoginData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export const CdcLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CdcLoginData>({
    resolver: zodResolver(cdcLoginSchema),
  });

  const onSubmit = async (data: CdcLoginData) => {
    setLoading(true);
    await login('cdc', data, '/auth/cdc/login', '/cdc/dashboard');
    setLoading(false);
  };

  // Placeholder OAuth handlers
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          CDC Login
        </h2>

        <p className="text-sm text-gray-300 mb-6 text-center">
          CDC accounts are created by administrators.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white text-gray-800 font-medium border border-gray-300 hover:bg-gray-100 transition"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          {/* GitHub Login */}
          <button
            type="button"
            onClick={handleGithubLogin}
            className="w-full mt-3 flex items-center justify-center gap-3 py-3 rounded-lg bg-black text-white font-medium border border-gray-700 hover:bg-gray-900 transition"
          >
            <FaGithub size={20} />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-800 px-4 text-sm text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Email */}
          <FormInput
            label="Official Email"
            name="email"
            type="email"
            placeholder="you@institution.gov"
            register={register}
            error={errors.email}
          />

          {/* Password */}
          <PasswordField
            label="Password"
            name="password"
            register={register}
            error={errors.password}
          />

          {/* Forgot Password */}
          <div className="flex justify-between items-center mb-4">
            <Link
              to="#"
              className="text-sm text-primary-light hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-dark text-white rounded-lg hover:bg-primary-light transition flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="text-primary-light hover:underline"
          >
            Back to Role Selection
          </button>
        </div>
      </motion.div>
    </div>
  );
};