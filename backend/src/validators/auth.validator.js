"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.alumniSignupSchema = exports.studentSignupSchema = void 0;
// src/validators/auth.validator.ts
const zod_1 = require("zod");
exports.studentSignupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    enrollmentNumber: zod_1.z.string().min(1),
    branch: zod_1.z.string().min(1),
    course: zod_1.z.string().min(1),
    graduationYear: zod_1.z.number().int().positive(),
});
exports.alumniSignupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    passingYear: zod_1.z.number().int().positive(),
    currentCompany: zod_1.z.string().optional(),
    designation: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8),
});
//# sourceMappingURL=auth.validator.js.map