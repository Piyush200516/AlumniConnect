import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alumniLoginSchema, AlumniLogin } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const AlumniLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlumniLogin>({ resolver: zodResolver(alumniLoginSchema) });

  const onSubmit = async (data: AlumniLogin) => {
    setLoading(true);
    await login('alumni', data, '/api/auth/alumni/login', '/alumni/dashboard');
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
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Alumni Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Email" name="email" type="email" placeholder="you@domain.com" register={register} error={errors.email} />
          <PasswordField label="Password" name="password" register={register} error={errors.password} />
          <div className="flex justify-between items-center mb-4">
            <Link to="#" className="text-sm text-primary-light hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary-dark text-white rounded hover:bg-primary-light transition flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          New alumni?{' '}
          <Link to="/auth/alumni/signup" className="text-primary-light hover:underline">
            Sign up here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
