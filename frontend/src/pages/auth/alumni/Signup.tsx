import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alumniSignupSchema } from '../../../types/auth';
import type { AlumniSignup as AlumniSignupData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const AlumniSignup = () => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlumniSignupData>({ resolver: zodResolver(alumniSignupSchema) });

  const onSubmit = async (data: AlumniSignupData) => {
    setLoading(true);
    await signup('alumni', data, '/auth/alumni/signup', '/alumni/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Alumni Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Full Name" name="fullName" placeholder="John Doe" register={register} error={errors.fullName} />
          <FormInput label="Email" name="email" type="email" placeholder="you@domain.com" register={register} error={errors.email} />
          <FormInput label="Enrollment Number" name="enrollmentNumber" placeholder="2023001" register={register} error={errors.enrollmentNumber} />
          <FormInput label="Passing Year" name="passingYear" placeholder="2022" register={register} error={errors.passingYear} />
          <FormInput label="Current Company" name="company" placeholder="Acme Corp" register={register} error={errors.company} />
          <FormInput label="Current Designation" name="designation" placeholder="Software Engineer" register={register} error={errors.designation} />
          <FormInput label="LinkedIn URL" name="linkedinUrl" placeholder="https://linkedin.com/in/username" register={register} error={errors.linkedinUrl} />
          <PasswordField label="Password" name="password" register={register} error={errors.password} />
          <PasswordField label="Confirm Password" name="confirmPassword" register={register} error={errors.confirmPassword} />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary-dark text-white rounded hover:bg-primary-light transition flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          Already have an account?{' '}
          <Link to="/auth/alumni/login" className="text-primary-light hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};
