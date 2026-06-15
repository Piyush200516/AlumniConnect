"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/auth.service.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const token_1 = require("../utils/token");
const auth_validator_1 = require("../validators/auth.validator");
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const error_1 = require("../utils/error");
class AuthService {
    /** Student signup */
    async studentSignup(payload) {
        try {
            const data = auth_validator_1.studentSignupSchema.parse(payload);
            const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
            if (existing)
                throw new error_1.ApiError(409, 'Email already in use');
            const hashed = await bcryptjs_1.default.hash(data.password, 12);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashed,
                    role: client_1.Role.STUDENT,
                    studentProfile: {
                        create: {
                            fullName: data.name,
                            enrollmentNumber: data.enrollmentNumber,
                            branch: data.branch,
                            course: data.course,
                            graduationYear: data.graduationYear,
                        },
                    },
                },
            });
            const verificationToken = await (0, token_1.createEmailVerificationToken)(user.id);
            await (0, email_1.sendVerificationEmail)(user.email, verificationToken);
            const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
            const refreshToken = await (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
            logger_1.logger.info(`Student signup successful: ${user.email}`);
            return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
        }
        catch (err) {
            logger_1.logger.error(`Student signup failed: ${err instanceof Error ? err.message : err}`);
            if (err instanceof error_1.ApiError)
                throw err;
            // Zod validation errors
            if (err && typeof err === 'object' && 'issues' in err) {
                throw new error_1.ApiError(400, 'Invalid signup data', err);
            }
            throw new error_1.ApiError(500, 'Internal server error');
        }
    }
    /** Alumni signup */
    async alumniSignup(payload) {
        const data = auth_validator_1.alumniSignupSchema.parse(payload);
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new Error('Email already in use');
        const hashed = await bcryptjs_1.default.hash(data.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashed,
                role: client_1.Role.ALUMNI,
                alumniProfile: {
                    create: {
                        fullName: data.name,
                        passingYear: data.passingYear,
                        currentCompany: data.currentCompany,
                        designation: data.designation,
                    },
                },
            },
        });
        const verificationToken = await (0, token_1.createEmailVerificationToken)(user.id);
        await (0, email_1.sendVerificationEmail)(user.email, verificationToken);
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = await (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
    }
    /** Login (generic) */
    async login(payload, forcedRole) {
        try {
            const loginData = auth_validator_1.loginSchema.parse(payload);
            // Log DATABASE_URL status
            logger_1.logger.info(`Login service check: DATABASE_URL exists = ${!!process.env.DATABASE_URL}`);
            // Log Prisma connection status
            try {
                await prisma_1.prisma.$connect();
                logger_1.logger.info("Database connection active and verified.");
            }
            catch (connError) {
                logger_1.logger.error(`Database connection verification failed: ${connError instanceof Error ? connError.message : connError}`);
                throw new error_1.ApiError(500, 'Database connection error');
            }
            // Log User lookup
            logger_1.logger.info(`Attempting user lookup for email: ${loginData.email}`);
            const user = await prisma_1.prisma.user.findUnique({ where: { email: loginData.email } });
            if (!user) {
                logger_1.logger.warn(`User lookup failed: no user found with email: ${loginData.email}`);
                throw new error_1.ApiError(401, 'Invalid email or password');
            }
            logger_1.logger.info(`User lookup successful: found user with ID: ${user.id}, role: ${user.role}`);
            if (forcedRole && user.role !== forcedRole) {
                logger_1.logger.warn(`Role verification failed. Expected: ${forcedRole}, got: ${user.role}`);
                throw new error_1.ApiError(401, 'Invalid email or password');
            }
            if (!user.isEmailVerified) {
                logger_1.logger.warn(`Email verification check failed for user ID: ${user.id}`);
                throw new error_1.ApiError(401, 'Email not verified');
            }
            if (user.status !== 'ACTIVE') {
                logger_1.logger.warn(`User status is not active: ${user.status} for user ID: ${user.id}`);
                throw new error_1.ApiError(403, 'Account not active');
            }
            // Log Password comparison
            logger_1.logger.info(`Comparing password for user email: ${loginData.email}`);
            if (typeof user.password !== 'string') {
                logger_1.logger.error(`Password stored in DB is not a string for user ID: ${user.id}`);
                throw new error_1.ApiError(500, 'Internal server error');
            }
            const match = await bcryptjs_1.default.compare(loginData.password, user.password);
            logger_1.logger.info(`Password comparison completed. Result match: ${match}`);
            if (!match) {
                logger_1.logger.warn(`Invalid credentials provided for user: ${loginData.email}`);
                throw new error_1.ApiError(401, 'Invalid email or password');
            }
            const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role });
            const refreshToken = await (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email, role: user.role });
            logger_1.logger.info(`Login successful: user logged in with ID ${user.id}`);
            return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
        }
        catch (err) {
            if (err instanceof error_1.ApiError)
                throw err;
            // Zod validation errors
            if (err && typeof err === 'object' && 'issues' in err) {
                throw new error_1.ApiError(400, 'Invalid login data', err);
            }
            // Handle other Prisma or system errors
            logger_1.logger.error(`Login failed: ${err instanceof Error ? err.message : err}`);
            throw new error_1.ApiError(500, err instanceof Error ? err.message : 'Internal server error');
        }
    }
    /** Verify email */
    async verifyEmail(token) {
        const userId = await (0, token_1.verifyEmailToken)(token);
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
    }
    /** Forgot password */
    async forgotPassword(email) {
        const parsed = auth_validator_1.forgotPasswordSchema.parse({ email });
        const user = await prisma_1.prisma.user.findUnique({ where: { email: parsed.email } });
        if (!user)
            throw new Error('User not found');
        const resetToken = await (0, token_1.createPasswordResetToken)(user.id);
        await (0, email_1.sendPasswordResetEmail)(user.email, resetToken);
    }
    /** Reset password */
    async resetPassword(token, newPassword) {
        const parsed = auth_validator_1.resetPasswordSchema.parse({ token, newPassword });
        const userId = await (0, token_1.verifyPasswordResetToken)(parsed.token);
        const hashed = await bcryptjs_1.default.hash(parsed.newPassword, 12);
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map