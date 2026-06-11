import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cdcLoginSchema } from '../../../types/auth';
import type { CdcLogin as CdcLoginData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CdcLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CdcLoginData>({ resolver: zodResolver(cdcLoginSchema) });

  const onSubmit = async (data: CdcLoginData) => {
    setLoading(true);
    await login('cdc', data, '/api/auth/cdc/login', '/cdc/dashboard');
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
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">CDC Login</h2>
        <p className="text-sm text-gray-300 mb-4 text-center">
          CDC accounts are created by administrators.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Official Email" name="email" type="email" placeholder="you@institution.gov" register={register} error={errors.email} />
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
        <div className="mt-4 text-center">
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
