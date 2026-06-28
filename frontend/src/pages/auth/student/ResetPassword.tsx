import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, LoadingSpinner } from '../../../components/auth';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import api from '../../../services/api';
import { toastError } from '../../../utils/toast';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const StudentResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toastError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.password });
      setSuccess(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Set New Password</h2>
        
        {!token && !success ? (
           <div className="text-center">
             <div className="text-red-400 mb-4">
               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <p className="text-white mb-6">Invalid or missing reset token.</p>
             <Link
               to="/auth/student/login"
               className="w-full inline-block py-2 bg-primary-dark text-white rounded hover:bg-primary-light transition text-center"
             >
               Back to Login
             </Link>
           </div>
        ) : success ? (
          <div className="text-center">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-white mb-6">Your password has been successfully reset.</p>
            <Link
              to="/auth/student/login"
              className="w-full inline-block py-2 bg-primary-dark text-white rounded hover:bg-primary-light transition text-center"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="text-gray-300 text-sm mb-6 text-center">
              Please enter your new password below.
            </p>
            <FormInput
              label="New Password"
              name="password"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.password}
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.confirmPassword}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-4 bg-primary-dark text-white rounded hover:bg-primary-light transition flex items-center justify-center"
            >
              {loading ? <LoadingSpinner /> : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
