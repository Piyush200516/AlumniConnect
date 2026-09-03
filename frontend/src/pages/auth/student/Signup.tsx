import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSignupSchema } from '../../../types/auth';
import type { StudentSignup as StudentSignupData } from '../../../types/auth';
import { FormInput, PasswordField, LoadingSpinner } from '../../../components/auth';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { getApiUrl } from '../../../services/api';
import {
  User,
  Mail,
  Hash,
  BookOpen,
  GraduationCap,
  Calendar,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StudentSignup = () => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    document.title = 'Student Sign Up | AlumniConnect';
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<StudentSignupData>({
    resolver: zodResolver(studentSignupSchema),
    mode: 'onTouched',
  });

  const handleNextStep = async () => {
    // Validate step 1 fields before proceeding
    const isStep1Valid = await trigger([
      'name',
      'email',
      'enrollmentNumber',
      'branch',
      'course',
      'graduationYear',
    ]);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: StudentSignupData) => {
    setLoading(true);
    await signup('student', data, '/auth/student/signup', '/student/dashboard');
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/student/google');
  };

  const handleGithubLogin = () => {
    window.location.href = getApiUrl('/auth/student/github');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] p-4 relative overflow-hidden my-auto py-12">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none" />

      <motion.div
        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 w-full max-w-2xl shadow-2xl relative z-10 my-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <GraduationCap className="w-4 h-4" />
            Student Portal Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Connect with campus alumni, explore career opportunities, and manage your academic network.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <FcGoogle size={20} />
            <span>Google Sign Up</span>
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <FaGithub size={19} className="text-white" />
            <span>GitHub Sign Up</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6 flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Or fill registration details
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              1
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === 1 ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              Academic Profile
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-white/10">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: step === 2 ? '100%' : '0%' }}
            ></div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === 2 ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              Account Security
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <FormInput
                    label="Full Name"
                    name="name"
                    placeholder="John Doe"
                    register={register}
                    error={errors.name}
                    icon={User}
                  />
                  <FormInput
                    label="College Email"
                    name="email"
                    type="email"
                    placeholder="student@college.edu"
                    register={register}
                    error={errors.email}
                    icon={Mail}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <FormInput
                    label="Enrollment Number"
                    name="enrollmentNumber"
                    placeholder="e.g. 2023001"
                    register={register}
                    error={errors.enrollmentNumber}
                    icon={Hash}
                  />
                  <FormInput
                    label="Branch"
                    name="branch"
                    placeholder="Computer Science"
                    register={register}
                    error={errors.branch}
                    icon={BookOpen}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <FormInput
                    label="Course"
                    name="course"
                    placeholder="B.Tech / M.Tech / MCA"
                    register={register}
                    error={errors.course}
                    icon={GraduationCap}
                  />
                  <FormInput
                    label="Graduation Year"
                    name="graduationYear"
                    placeholder="2026"
                    register={register}
                    validation={{ valueAsNumber: true }}
                    error={errors.graduationYear}
                    icon={Calendar}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer text-sm"
                  >
                    <span>Next Step: Security</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <PasswordField
                  label="Password"
                  name="password"
                  register={register}
                  error={errors.password}
                  icon={Lock}
                />
                <PasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  register={register}
                  error={errors.confirmPassword}
                  icon={CheckCircle2}
                />

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Security Hint:</span> Choose a strong password with at least 8 characters containing letters and numbers.
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer text-sm"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Student Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Already registered as a student?{' '}
            <Link to="/auth/student/login" className="text-blue-400 hover:underline font-semibold">
              Log in here
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Are you an alumnus?{' '}
            <Link to="/auth/alumni/signup" className="text-indigo-400 hover:underline font-semibold">
              Register as Alumni
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

