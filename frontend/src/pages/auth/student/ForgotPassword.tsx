import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, LoadingSpinner } from '../../../components/auth';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toastError } from '../../../utils/toast';
import { KeyRound, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid college email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const StudentForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Reset Student Password | AlumniConnect';
  }, []);

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
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your college email address and we'll send you instructions to reset your password."
      badgeText="Student Portal"
      accentColor="blue"
      icon={KeyRound}
      heroTitle="Secure Access Recovery"
      heroSubtitle="Maintain secure account access to your student profile, mentorship requests, and career tools."
      stats={[
        { label: 'Security Level', value: '256-bit SSL' },
        { label: 'Reset Link Validity', value: '15 Minutes' },
      ]}
      footerContent={
        <Link
          to="/auth/student/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Login</span>
        </Link>
      }
    >
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2">Instructions Sent!</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            If an account exists for that college email, check your inbox for password reset instructions.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Return to Login</span>
          </Link>
        </motion.div>
      ) : (
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

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className="w-full py-3.5 px-4 mt-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border border-white/10 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <LoadingSpinner /> : 'Send Password Reset Link'}
          </motion.button>
        </form>
      )}
    </AuthLayout>
  );
};
