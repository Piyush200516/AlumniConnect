"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordResetToken = exports.createPasswordResetToken = exports.verifyEmailToken = exports.createEmailVerificationToken = void 0;
// src/utils/token.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET ?? 'email-verify-secret';
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET ?? 'password-reset-secret';
/** Create email verification token (valid 24h) */
const createEmailVerificationToken = async (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, EMAIL_VERIFY_SECRET, { expiresIn: '24h' });
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token, emailVerifyExpiry: expiry } });
    return token;
};
exports.createEmailVerificationToken = createEmailVerificationToken;
/** Verify email token and return userId */
const verifyEmailToken = async (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, EMAIL_VERIFY_SECRET);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.emailVerifyToken !== token)
        throw new Error('Invalid or expired email verification token');
    if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date())
        throw new Error('Email verification token expired');
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: null, emailVerifyExpiry: null } });
    return user.id;
};
exports.verifyEmailToken = verifyEmailToken;
/** Create password reset token (valid 1h) */
const createPasswordResetToken = async (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, PASSWORD_RESET_SECRET, { expiresIn: '1h' });
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    await prisma_1.prisma.user.update({ where: { id: userId }, data: { resetToken: token, resetTokenExpiry: expiry } });
    return token;
};
exports.createPasswordResetToken = createPasswordResetToken;
/** Verify password reset token and return userId */
const verifyPasswordResetToken = async (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, PASSWORD_RESET_SECRET);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.resetToken !== token)
        throw new Error('Invalid or expired password reset token');
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date())
        throw new Error('Password reset token expired');
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { resetToken: null, resetTokenExpiry: null } });
    return user.id;
};
exports.verifyPasswordResetToken = verifyPasswordResetToken;
//# sourceMappingURL=token.js.map