import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cdcLoginSchema } from '../../../types/auth';
import type { CdcLogin as CdcLoginData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Building2, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { getApiUrl } from '../../../services/api';

export const CdcLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'CDC Administrative Login | AlumniConnect';
  }, []);

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

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/cdc/google');
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl('/auth/cdc/github');
  };

  return (
    <AuthLayout
      title="CDC Official Portal"
      subtitle="Administrative entrance for Career Development Cell officers and institutional coordinators."
      badgeText="Admin Portal"
      accentColor="emerald"
      icon={Building2}
      heroTitle="Institutional Placement & Alumni Management"
      heroSubtitle="Monitor campus placement metrics, oversee company drives, manage mentorship events, and track student outcomes."
      stats={[
        { label: 'Placement Rate', value: '98.4%' },
        { label: 'Active Recruiters', value: '450+' },
        { label: 'Annual Drives Hosted', value: '180+' },
      ]}
      footerContent={
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>CDC accounts are provisioned exclusively by system administrators.</span>
        </div>
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
          or sign in with official email
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Official Email"
          name="email"
          type="email"
          placeholder="you@institution.gov"
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

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="w-full py-3.5 px-4 mt-2 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-white/10 shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
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
                <span>Sign In as CDC Official</span>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </AuthLayout>
  );
};
