import { z } from 'zod';

// Certification validation schema
const certificationSchema = z.object({
  name: z.string().min(1, 'Certification Name is required'),
  issuingOrganization: z.string().min(1, 'Issuing Organization is required'),
  issueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  certificateUrl: z.string().url('Invalid certificate URL'),
});

// Save Draft Schema - all fields are optional to allow incremental progress saving
export const saveDraftSchema = z.object({
  fullName: z.string().optional().nullable(),
  enrollmentNumber: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  profileImage: z.string().optional().nullable(),

  aadharNumber: z.string().optional().nullable(),
  panCard: z.string().optional().nullable(),
  collegeIdNumber: z.string().optional().nullable(),

  fatherName: z.string().optional().nullable(),
  fatherOccupation: z.string().optional().nullable(),
  fatherPhone: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  motherOccupation: z.string().optional().nullable(),
  motherPhone: z.string().optional().nullable(),
  familyIncome: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),

  currentAddress: z.string().optional().nullable(),
  currentCity: z.string().optional().nullable(),
  currentState: z.string().optional().nullable(),
  currentPincode: z.string().optional().nullable(),
  permanentAddress: z.string().optional().nullable(),
  permanentCity: z.string().optional().nullable(),
  permanentState: z.string().optional().nullable(),
  permanentPincode: z.string().optional().nullable(),
  sameAsCurrent: z.boolean().optional().default(false),

  class10Board: z.string().optional().nullable(),
  class10School: z.string().optional().nullable(),
  class10Percentage: z.number().optional().nullable(),
  class10PassingYear: z.number().int().optional().nullable(),
  class12Board: z.string().optional().nullable(),
  class12School: z.string().optional().nullable(),
  class12Percentage: z.number().optional().nullable(),
  class12PassingYear: z.number().int().optional().nullable(),
  diplomaCollege: z.string().optional().nullable(),
  diplomaBranch: z.string().optional().nullable(),
  diplomaCGPA: z.number().optional().nullable(),
  diplomaPassingYear: z.number().int().optional().nullable(),

  currentCourse: z.string().optional().nullable(),
  currentBranch: z.string().optional().nullable(),
  currentSemester: z.number().int().optional().nullable(),
  currentCGPA: z.number().optional().nullable(),
  
  sgpaSemester1: z.number().optional().nullable(),
  sgpaSemester2: z.number().optional().nullable(),
  sgpaSemester3: z.number().optional().nullable(),
  sgpaSemester4: z.number().optional().nullable(),
  sgpaSemester5: z.number().optional().nullable(),
  sgpaSemester6: z.number().optional().nullable(),
  sgpaSemester7: z.number().optional().nullable(),
  sgpaSemester8: z.number().optional().nullable(),

  careerPreference: z.string().optional().nullable(),
  primaryDomain: z.string().optional().nullable(),
  secondaryDomain: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  linkedinUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  
  certifications: z.array(certificationSchema).optional().default([]),
});

// Final Submit Schema - enforces business verification rules
export const submitApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  enrollmentNumber: z.string().min(2, 'Enrollment Number is required'),
  email: z.string().email('Valid Email is required'),
  phone: z.string().min(10, 'Valid Phone Number is required'),
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.string().or(z.date()).transform((val) => new Date(val)),
  profileImage: z.string().url('Profile photo is required'),

  aadharNumber: z.string().min(12, '12-digit Aadhar card number is required').max(12, '12-digit Aadhar card number is required'),
  panCard: z.string().optional().nullable(),
  collegeIdNumber: z.string().min(2, 'College ID Card Number is required'),

  fatherName: z.string().min(2, 'Father\'s Name is required'),
  fatherOccupation: z.string().min(2, 'Father\'s Occupation is required'),
  fatherPhone: z.string().min(10, 'Father\'s Mobile Number is required'),
  motherName: z.string().min(2, 'Mother\'s Name is required'),
  motherOccupation: z.string().min(2, 'Mother\'s Occupation is required'),
  motherPhone: z.string().min(10, 'Mother\'s Mobile Number is required'),
  familyIncome: z.string().min(1, 'Family Annual Income is required'),
  emergencyContact: z.string().min(10, 'Emergency Contact is required'),

  currentAddress: z.string().min(5, 'Current Address is required'),
  currentCity: z.string().min(2, 'Current City is required'),
  currentState: z.string().min(2, 'Current State is required'),
  currentPincode: z.string().min(6, '6-digit Current Pincode is required'),
  permanentAddress: z.string().min(5, 'Permanent Address is required'),
  permanentCity: z.string().min(2, 'Permanent City is required'),
  permanentState: z.string().min(2, 'Permanent State is required'),
  permanentPincode: z.string().min(6, '6-digit Permanent Pincode is required'),
  sameAsCurrent: z.boolean().default(false),

  class10Board: z.string().min(2, '10th Board Name is required'),
  class10School: z.string().min(2, '10th School Name is required'),
  class10Percentage: z.number().min(0).max(100, '10th Percentage must be between 0 and 100'),
  class10PassingYear: z.number().int().min(2010).max(2028),
  
  // Accept either 12th details OR Diploma details
  class12Board: z.string().optional().nullable(),
  class12School: z.string().optional().nullable(),
  class12Percentage: z.number().optional().nullable(),
  class12PassingYear: z.number().int().optional().nullable(),
  diplomaCollege: z.string().optional().nullable(),
  diplomaBranch: z.string().optional().nullable(),
  diplomaCGPA: z.number().optional().nullable(),
  diplomaPassingYear: z.number().int().optional().nullable(),

  currentCourse: z.string().min(2, 'Current Course is required'),
  currentBranch: z.string().min(2, 'Current Branch is required'),
  currentSemester: z.number().int().min(1).max(8, 'Current Semester must be between 1 and 8'),
  currentCGPA: z.number().min(0).max(10, 'CGPA must be between 0 and 10'),
  
  sgpaSemester1: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester2: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester3: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester4: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester5: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester6: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester7: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester8: z.number().min(0).max(10).optional().nullable(),

  careerPreference: z.enum(['Job', 'Higher Studies', 'Startup', 'Government Job']),
  primaryDomain: z.string().min(1, 'Primary Domain is required'),
  secondaryDomain: z.string().optional().nullable(),
  skills: z.array(z.string()).min(1, 'Add at least 1 skill'),
  linkedinUrl: z.string().url('Valid LinkedIn URL is required'),
  githubUrl: z.string().url('Valid GitHub URL is required'),
  portfolioUrl: z.string().optional().nullable().or(z.literal('')),
  resumeUrl: z.string().url('Resume upload is required'),
  
  certifications: z.array(certificationSchema).optional().default([]),
}).refine((data) => {
  // Either 12th details must be fully filled, OR Diploma details must be fully filled
  const has12th = !!(data.class12Board && data.class12School && data.class12Percentage && data.class12PassingYear);
  const hasDiploma = !!(data.diplomaCollege && data.diplomaBranch && data.diplomaCGPA && data.diplomaPassingYear);
  return has12th || hasDiploma;
}, {
  message: 'Fill either 12th details or Diploma details completely',
  path: ['class12Board'],
});

// Allowed Post-Submission Updates Schema
export const allowedUpdatesSchema = z.object({
  resumeUrl: z.string().url('Valid Resume URL is required').optional(),
  primaryDomain: z.string().min(1, 'Primary Domain is required').optional(),
  secondaryDomain: z.string().optional().nullable(),
  currentCGPA: z.number().min(0).max(10, 'CGPA must be between 0 and 10').optional(),
  sgpaSemester1: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester2: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester3: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester4: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester5: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester6: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester7: z.number().min(0).max(10).optional().nullable(),
  sgpaSemester8: z.number().min(0).max(10).optional().nullable(),
});
