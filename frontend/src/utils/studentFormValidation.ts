// ─────────────────────────────────────────────────────────────────────────────
// studentFormValidation.ts
// Reusable, pure validation functions for the Student Registration Form.
// No external libraries — works with plain React useState.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export interface Step1Data {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  branch: string;
  course: string;
  graduationYear: string;
}

export interface Step2Data {
  password: string;
  confirmPassword: string;
}

export type RegistrationFormData = Step1Data & Step2Data;

export type FormErrors = Partial<Record<keyof RegistrationFormData, string>>;

export type PasswordStrength = 'Weak' | 'Medium' | 'Strong' | '';

// ── Step 1 Validators ──────────────────────────────────────────────────────────

/**
 * Validates the student's full name.
 * Rules: Required | Letters & spaces only | 3–50 characters
 */
export const validateFullName = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters and spaces.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters long.' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates the college email address.
 * Rules: Required | Valid email format | Must end with @acropolis.in
 */
export const validateEmail = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'College email is required.' };
  }
  // RFC-5322 simplified regex
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  if (!trimmed.toLowerCase().endsWith('@acropolis.in')) {
    return { isValid: false, error: 'Email must use the @acropolis.in domain.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates enrollment number (format only — uniqueness is async).
 * Rules: Required | Numeric digits only | 7–10 digits
 */
export const validateEnrollmentNumberFormat = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Enrollment number is required.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, error: 'Enrollment number must contain digits only.' };
  }
  if (trimmed.length < 7 || trimmed.length > 10) {
    return { isValid: false, error: 'Enrollment number must be 7–10 digits.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Simulates an asynchronous API call to check if enrollment number is unique.
 * In production, replace with a real API call.
 * @returns ValidationResult after ~900ms simulated delay
 */
export const checkEnrollmentUniqueness = async (
  enrollmentNumber: string
): Promise<ValidationResult> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 900));

  // These numbers are "already registered" — simulated duplicates
  const takenNumbers = new Set(['1234567', '7654321', '9999999', '0000001']);

  if (takenNumbers.has(enrollmentNumber.trim())) {
    return {
      isValid: false,
      error: 'This enrollment number is already registered.',
    };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates branch selection from dropdown.
 * Rules: Required — must select a non-empty value
 */
export const validateBranch = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Please select your branch.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates course selection from dropdown.
 * Rules: Required — must select a non-empty value
 */
export const validateCourse = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Please select your course.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates graduation year.
 * Rules: Required | Must be a number | Between current year and current year + 6
 */
export const validateGraduationYear = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Graduation year is required.' };
  }
  const year = Number(trimmed);
  if (!Number.isInteger(year) || trimmed.includes('.')) {
    return { isValid: false, error: 'Graduation year must be a whole number.' };
  }
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 6;
  if (year < currentYear || year > maxYear) {
    return {
      isValid: false,
      error: `Year must be between ${currentYear} and ${maxYear}.`,
    };
  }
  return { isValid: true, error: '' };
};

// ── Step 2 Validators ──────────────────────────────────────────────────────────

/**
 * Calculates the strength of a password.
 * Returns: 'Weak' | 'Medium' | 'Strong' | ''
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return '';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;       // bonus for longer passwords
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Medium';
  return 'Strong';
};

/**
 * Validates the password.
 * Rules: Required | Min 8 chars | 1 uppercase | 1 lowercase | 1 digit | 1 special char
 */
export const validatePassword = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (value.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(value)) {
    return { isValid: false, error: 'Must include at least 1 uppercase letter (A–Z).' };
  }
  if (!/[a-z]/.test(value)) {
    return { isValid: false, error: 'Must include at least 1 lowercase letter (a–z).' };
  }
  if (!/\d/.test(value)) {
    return { isValid: false, error: 'Must include at least 1 number (0–9).' };
  }
  if (!/[^a-zA-Z0-9]/.test(value)) {
    return { isValid: false, error: 'Must include at least 1 special character (!@#$…).' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates that confirm password matches the original password.
 * Rules: Required | Must exactly match `password`
 */
export const validateConfirmPassword = (
  value: string,
  password: string
): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (value !== password) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true, error: '' };
};

// ── Batch Validators (for disabling Next/Submit buttons) ──────────────────────

/**
 * Returns true only if ALL Step 1 fields are individually valid.
 * Used to enable/disable the "Next Step" button.
 */
export const isStep1Valid = (data: Step1Data): boolean => {
  return (
    validateFullName(data.fullName).isValid &&
    validateEmail(data.email).isValid &&
    validateEnrollmentNumberFormat(data.enrollmentNumber).isValid &&
    validateBranch(data.branch).isValid &&
    validateCourse(data.course).isValid &&
    validateGraduationYear(data.graduationYear).isValid
  );
};

/**
 * Returns true only if ALL Step 2 fields are valid.
 * Used to enable/disable the "Submit" button.
 */
export const isStep2Valid = (data: Step2Data): boolean => {
  return (
    validatePassword(data.password).isValid &&
    validateConfirmPassword(data.confirmPassword, data.password).isValid
  );
};

// ── Constants ──────────────────────────────────────────────────────────────────

export const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Chemical Engineering',
  'Biotechnology',
] as const;

export const COURSE_OPTIONS = [
  'B.Tech',
  'M.Tech',
  'MCA',
  'BCA',
  'MBA',
  'B.Sc',
  'M.Sc',
  'Ph.D',
] as const;
