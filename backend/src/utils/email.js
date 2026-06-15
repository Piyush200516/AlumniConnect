"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const resend_1 = require("resend");
const resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@alumniconnect.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const sendVerificationEmail = async (to, token) => {
    if (!resend) {
        console.log("RESEND_API_KEY not configured. Skipping verification email.");
        return;
    }
    const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
    await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "AlumniConnect – Verify Your Email",
        html: `
      <p>Hello,</p>
      <p>Please verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, token) => {
    if (!resend) {
        console.log("RESEND_API_KEY not configured. Skipping reset email.");
        return;
    }
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "AlumniConnect – Password Reset Request",
        html: `
      <p>Hello,</p>
      <p>Reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=email.js.map