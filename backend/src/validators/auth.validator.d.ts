import { z } from 'zod';
export declare const studentSignupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    enrollmentNumber: z.ZodString;
    branch: z.ZodString;
    course: z.ZodString;
    graduationYear: z.ZodNumber;
}, z.core.$strip>;
export declare const alumniSignupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    passingYear: z.ZodNumber;
    currentCompany: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
