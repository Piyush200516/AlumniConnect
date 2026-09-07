import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Mail, Hash, BookOpen, GraduationCap, Calendar,
  Lock, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff,
  Loader2, ShieldCheck, AlertCircle,
} from 'lucide-react';

import {
  validateFullName,
  validateEmail,
  validateEnrollmentNumberFormat,
  checkEnrollmentUniqueness,
  validateBranch,
  validateCourse,
  validateGraduationYear,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
  isStep1Valid,
  isStep2Valid,
  BRANCH_OPTIONS,
  COURSE_OPTIONS,
  type RegistrationFormData,
  type FormErrors,
  type PasswordStrength,
} from '../../../utils/studentFormValidation';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
  icon: React.ElementType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
  isChecking?: boolean;
}

const InputField = ({
  label, id, type = 'text', value, placeholder, error,
  icon: Icon, onChange, onBlur, rightElement, isChecking,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1.5 mb-1">
    <label htmlFor={id} className="text-xs font-semibold text-slate-300 tracking-wide">
      {label}
    </label>
    <div className="relative flex items-center">
      <Icon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="off"
        className={`w-full pl-10 pr-${rightElement || isChecking ? '10' : '4'} py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
            : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/15'
          }`}
      />
      {isChecking && (
        <Loader2 className="absolute right-3.5 w-4 h-4 text-blue-400 animate-spin" />
      )}
      {rightElement && !isChecking && (
        <div className="absolute right-3.5">{rightElement}</div>
      )}
    </div>
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key={error}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-0.5"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  error?: string;
  icon: React.ElementType;
  options: readonly string[];
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

const SelectField = ({
  label, id, value, error, icon: Icon, options, placeholder, onChange, onBlur,
}: SelectFieldProps) => (
  <div className="flex flex-col gap-1.5 mb-1">
    <label htmlFor={id} className="text-xs font-semibold text-slate-300 tracking-wide">
      {label}
    </label>
    <div className="relative flex items-center">
      <Icon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
      <select
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer
          ${value ? 'text-white' : 'text-slate-500'}
          ${error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
            : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/15'
          }`}
        style={{ backgroundImage: 'none' }}
      >
        <option value="" disabled className="bg-[#0d1424] text-slate-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0d1424] text-white">
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3.5 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key={error}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-0.5"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Password strength indicator sub-component
const PasswordStrengthBar = ({ strength }: { strength: PasswordStrength }) => {
  if (!strength) return null;

  const config = {
    Weak:   { bars: 1, color: 'bg-red-500',    label: 'Weak',   labelColor: 'text-red-400' },
    Medium: { bars: 2, color: 'bg-yellow-400',  label: 'Medium', labelColor: 'text-yellow-400' },
    Strong: { bars: 3, color: 'bg-emerald-500', label: 'Strong', labelColor: 'text-emerald-400' },
  }[strength];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 space-y-1"
    >
      <div className="flex gap-1.5">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= config.bars ? config.color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${config.labelColor}`}>
        Password strength: {config.label}
      </p>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Initial state helpers
// ─────────────────────────────────────────────────────────────────────────────

const initialFormData: RegistrationFormData = {
  fullName: '',
  email: '',
  enrollmentNumber: '',
  branch: '',
  course: '',
  graduationYear: '',
  password: '',
  confirmPassword: '',
};

const initialErrors: FormErrors = {};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const StudentRegistrationForm = () => {
  // ── Form state ──
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [step, setStep] = useState<1 | 2>(1);

  // ── UI state ──
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false); // true once async check passed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Debounce ref for enrollment uniqueness check
  const enrollmentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passwordStrength: PasswordStrength = getPasswordStrength(formData.password);

  // ── Generic field change handler ──────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof RegistrationFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear the error as user types (re-validate on blur)
        setErrors((prev) => ({ ...prev, [field]: undefined }));

        // Special case: re-validate confirmPassword live when password changes
        if (field === 'password' && formData.confirmPassword) {
          const result = validateConfirmPassword(formData.confirmPassword, value);
          setErrors((prev) => ({ ...prev, confirmPassword: result.error || undefined }));
        }

        // For enrollment number: reset async check status on change
        if (field === 'enrollmentNumber') {
          setEnrollmentChecked(false);
        }
      },
    [formData.confirmPassword]
  );

  // ── Generic blur handler — triggers validation ────────────────────────────
  const handleBlur = useCallback(
    (field: keyof RegistrationFormData) =>
      (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;

        let result = { isValid: true, error: '' };

        switch (field) {
          case 'fullName':        result = validateFullName(value); break;
          case 'email':           result = validateEmail(value); break;
          case 'branch':          result = validateBranch(value); break;
          case 'course':          result = validateCourse(value); break;
          case 'graduationYear':  result = validateGraduationYear(value); break;
          case 'password':        result = validatePassword(value); break;
          case 'confirmPassword':
            result = validateConfirmPassword(value, formData.password);
            break;
          case 'enrollmentNumber':
            result = validateEnrollmentNumberFormat(value);
            if (result.isValid) {
              // Trigger async uniqueness check after format is valid
              triggerEnrollmentCheck(value);
            }
            break;
        }

        setErrors((prev) => ({
          ...prev,
          [field]: result.error || undefined,
        }));
      },
    [formData.password]
  );

  // ── Async enrollment uniqueness check ─────────────────────────────────────
  const triggerEnrollmentCheck = (value: string) => {
    // Debounce: cancel any pending check
    if (enrollmentDebounceRef.current) {
      clearTimeout(enrollmentDebounceRef.current);
    }
    setIsCheckingEnrollment(true);
    setEnrollmentChecked(false);

    enrollmentDebounceRef.current = setTimeout(async () => {
      const result = await checkEnrollmentUniqueness(value);
      setIsCheckingEnrollment(false);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, enrollmentNumber: result.error }));
        setEnrollmentChecked(false);
      } else {
        setErrors((prev) => ({ ...prev, enrollmentNumber: undefined }));
        setEnrollmentChecked(true);
      }
    }, 400); // 400ms debounce before firing
  };

  // ── Step 1 → Step 2: validate all Step 1 fields before proceeding ─────────
  const handleNextStep = async () => {
    // Run all synchronous validators for Step 1
    const newErrors: FormErrors = {};

    const nameResult = validateFullName(formData.fullName);
    if (!nameResult.isValid) newErrors.fullName = nameResult.error;

    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) newErrors.email = emailResult.error;

    const enrollResult = validateEnrollmentNumberFormat(formData.enrollmentNumber);
    if (!enrollResult.isValid) {
      newErrors.enrollmentNumber = enrollResult.error;
    }

    const branchResult = validateBranch(formData.branch);
    if (!branchResult.isValid) newErrors.branch = branchResult.error;

    const courseResult = validateCourse(formData.course);
    if (!courseResult.isValid) newErrors.course = courseResult.error;

    const yearResult = validateGraduationYear(formData.graduationYear);
    if (!yearResult.isValid) newErrors.graduationYear = yearResult.error;

    setErrors((prev) => ({ ...prev, ...newErrors }));

    // If format errors exist, don't proceed
    if (Object.keys(newErrors).length > 0) return;

    // If enrollment check hasn't been completed yet, run it now
    if (!enrollmentChecked) {
      setIsCheckingEnrollment(true);
      const uniqueResult = await checkEnrollmentUniqueness(formData.enrollmentNumber);
      setIsCheckingEnrollment(false);
      if (!uniqueResult.isValid) {
        setErrors((prev) => ({ ...prev, enrollmentNumber: uniqueResult.error }));
        return;
      }
      setEnrollmentChecked(true);
    }

    setStep(2);
  };

  // ── Step 2: final submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Step 2 fields
    const newErrors: FormErrors = {};

    const pwdResult = validatePassword(formData.password);
    if (!pwdResult.isValid) newErrors.password = pwdResult.error;

    const confirmResult = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (!confirmResult.isValid) newErrors.confirmPassword = confirmResult.error;

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) return;

    // Submit
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // ── Computed: is the "Next Step" button disabled? ─────────────────────────
  // Disabled when: Step 1 fields are invalid OR enrollment is still being checked
  const isNextDisabled =
    !isStep1Valid(formData) ||
    isCheckingEnrollment ||
    (validateEnrollmentNumberFormat(formData.enrollmentNumber).isValid && !enrollmentChecked);

  // ── Computed: is the "Submit" button disabled? ───────────────────────────
  const isSubmitDisabled = !isStep2Valid(formData) || isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────
  // Success Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] p-4">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-emerald-600/15 blur-[130px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Welcome to AlumniConnect, <span className="text-white font-semibold">{formData.fullName}</span>!
            Your student account has been created.
          </p>
          <div className="p-4 bg-white/5 rounded-xl text-left space-y-2 text-xs text-slate-300 mb-6">
            <p><span className="text-slate-500">Name:</span> <span className="text-white">{formData.fullName}</span></p>
            <p><span className="text-slate-500">Email:</span> <span className="text-white">{formData.email}</span></p>
            <p><span className="text-slate-500">Branch:</span> <span className="text-white">{formData.branch}</span></p>
            <p><span className="text-slate-500">Course:</span> <span className="text-white">{formData.course}</span></p>
            <p><span className="text-slate-500">Enrollment:</span> <span className="text-white">{formData.enrollmentNumber}</span></p>
          </div>
          <Link
            to="/auth/student/login"
            className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] p-4 relative overflow-hidden py-12">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none" />

      <motion.div
        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 w-full max-w-2xl shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <GraduationCap className="w-4 h-4" />
            Student Portal Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Connect with campus alumni, explore career opportunities, and manage your academic network.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-between mb-8 px-4">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= 1
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline transition-colors ${step === 1 ? 'text-blue-400' : 'text-slate-400'}`}>
              Academic Profile
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 h-0.5 mx-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: step === 2 ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === 2
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-semibold hidden sm:inline transition-colors ${step === 2 ? 'text-blue-400' : 'text-slate-400'}`}>
              Account Security
            </span>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="wait">

            {/* ══════════════ STEP 1 ══════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.28 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                  {/* Full Name */}
                  <InputField
                    label="Full Name"
                    id="fullName"
                    value={formData.fullName}
                    placeholder="e.g. Piyush Mishra"
                    error={errors.fullName}
                    icon={User}
                    onChange={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                  />

                  {/* College Email */}
                  <InputField
                    label="College Email"
                    id="email"
                    type="email"
                    value={formData.email}
                    placeholder="you@acropolis.in"
                    error={errors.email}
                    icon={Mail}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                  {/* Enrollment Number */}
                  <div className="flex flex-col gap-1.5 mb-1">
                    <label htmlFor="enrollmentNumber" className="text-xs font-semibold text-slate-300 tracking-wide">
                      Enrollment Number
                    </label>
                    <div className="relative flex items-center">
                      <Hash className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        id="enrollmentNumber"
                        type="text"
                        inputMode="numeric"
                        value={formData.enrollmentNumber}
                        placeholder="e.g. 2023001"
                        onChange={handleChange('enrollmentNumber')}
                        onBlur={handleBlur('enrollmentNumber')}
                        autoComplete="off"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2
                          ${errors.enrollmentNumber
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                            : enrollmentChecked
                            ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/15'
                            : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/15'
                          }`}
                      />
                      {isCheckingEnrollment && (
                        <Loader2 className="absolute right-3.5 w-4 h-4 text-blue-400 animate-spin" />
                      )}
                      {enrollmentChecked && !isCheckingEnrollment && (
                        <CheckCircle2 className="absolute right-3.5 w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.enrollmentNumber && (
                        <motion.p
                          key={errors.enrollmentNumber}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-0.5"
                        >
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {errors.enrollmentNumber}
                        </motion.p>
                      )}
                      {enrollmentChecked && !errors.enrollmentNumber && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-0.5"
                        >
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                          Enrollment number is available!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Graduation Year */}
                  <InputField
                    label="Graduation Year"
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    placeholder={String(new Date().getFullYear() + 1)}
                    error={errors.graduationYear}
                    icon={Calendar}
                    onChange={handleChange('graduationYear')}
                    onBlur={handleBlur('graduationYear')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                  {/* Branch */}
                  <SelectField
                    label="Branch"
                    id="branch"
                    value={formData.branch}
                    placeholder="— Select Branch —"
                    error={errors.branch}
                    icon={BookOpen}
                    options={BRANCH_OPTIONS}
                    onChange={handleChange('branch')}
                    onBlur={handleBlur('branch')}
                  />

                  {/* Course */}
                  <SelectField
                    label="Course"
                    id="course"
                    value={formData.course}
                    placeholder="— Select Course —"
                    error={errors.course}
                    icon={GraduationCap}
                    options={COURSE_OPTIONS}
                    onChange={handleChange('course')}
                    onBlur={handleBlur('course')}
                  />
                </div>

                {/* Next Step button */}
                <div className="pt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isNextDisabled}
                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm
                      ${isNextDisabled
                        ? 'bg-blue-700/40 text-blue-300/50 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer'
                      }`}
                  >
                    {isCheckingEnrollment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Enrollment…</span>
                      </>
                    ) : (
                      <>
                        <span>Next Step: Security</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 2 ══════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
                className="space-y-1"
              >
                {/* Password */}
                <div className="flex flex-col gap-1.5 mb-1">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300 tracking-wide">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      placeholder="Create a strong password"
                      onChange={handleChange('password')}
                      onBlur={handleBlur('password')}
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2
                        ${errors.password
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/15'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  <PasswordStrengthBar strength={passwordStrength} />
                  <AnimatePresence mode="wait">
                    {errors.password && (
                      <motion.p
                        key={errors.password}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-0.5"
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5 mb-1">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300 tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <ShieldCheck className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      placeholder="Re-enter your password"
                      onChange={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2
                        ${errors.confirmPassword
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                          : formData.confirmPassword && !errors.confirmPassword
                          ? 'border-emerald-500/60'
                          : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/15'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {errors.confirmPassword && (
                      <motion.p
                        key={errors.confirmPassword}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-0.5"
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                    {formData.confirmPassword && !errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-0.5"
                      >
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        Passwords match!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password rules hint */}
                <div className="p-3.5 bg-blue-500/8 border border-blue-500/20 rounded-xl text-[11px] text-slate-400 space-y-1 mt-3">
                  <p className="font-semibold text-slate-300 mb-1.5">Password must contain:</p>
                  {[
                    { label: 'At least 8 characters', pass: formData.password.length >= 8 },
                    { label: '1 uppercase letter (A–Z)', pass: /[A-Z]/.test(formData.password) },
                    { label: '1 lowercase letter (a–z)', pass: /[a-z]/.test(formData.password) },
                    { label: '1 number (0–9)', pass: /\d/.test(formData.password) },
                    { label: '1 special character (!@#$…)', pass: /[^a-zA-Z0-9]/.test(formData.password) },
                  ].map(({ label, pass }) => (
                    <div key={label} className={`flex items-center gap-2 transition-colors ${pass ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${pass ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-5 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`flex-1 w-full py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm
                      ${isSubmitDisabled
                        ? 'bg-gradient-to-r from-blue-700/40 to-indigo-700/40 text-blue-300/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account…</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
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
