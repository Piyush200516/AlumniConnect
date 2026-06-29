import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, LoadingSpinner } from '../../../components/auth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../../../services/api';
import { toastError } from '../../../utils/toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const AlumniForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to send reset email');
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
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Reset Password</h2>
        {success ? (
          <div className="text-center">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-white mb-6">If an account exists for that email, we have sent password reset instructions.</p>
            <Link
              to="/auth/alumni/login"
              className="w-full inline-block py-2 bg-primary-dark text-white rounded hover:bg-primary-light transition text-center"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="text-gray-300 text-sm mb-6 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@domain.com"
              register={register}
              error={errors.email}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-4 bg-primary-dark text-white rounded hover:bg-primary-light transition flex items-center justify-center"
            >
              {loading ? <LoadingSpinner /> : 'Send Reset Link'}
            </button>
            <div className="mt-4 text-center">
              <Link to="/auth/alumni/login" className="text-sm text-primary-light hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
