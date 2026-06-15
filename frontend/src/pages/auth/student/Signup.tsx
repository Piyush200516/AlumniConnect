import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSignupSchema } from '../../../types/auth';
import type { StudentSignup as StudentSignupData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const StudentSignup = () => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSignupData>({ resolver: zodResolver(studentSignupSchema) });

  const onSubmit = async (data: StudentSignupData) => {
    setLoading(true);
    await signup('student', data, '/auth/student/signup', '/student/dashboard');
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
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Student Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Full Name" name="name" placeholder="John Doe" register={register} error={errors.name} />
          <FormInput label="College Email" name="email" type="email" placeholder="you@college.edu" register={register} error={errors.email} />
          <FormInput label="Enrollment Number" name="enrollmentNumber" placeholder="2023001" register={register} error={errors.enrollmentNumber} />
          <FormInput label="Branch" name="branch" placeholder="Computer Science" register={register} error={errors.branch} />
          <FormInput label="Graduation Year" name="graduationYear" placeholder="2026" register={register} validation={{ valueAsNumber: true }} error={errors.graduationYear} />
          <FormInput label="Course" name="course" placeholder="B.Tech / M.Tech / MBA" register={register} error={errors.course} />
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
          <Link to="/auth/student/login" className="text-primary-light hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};
