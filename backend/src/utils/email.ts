// src/utils/email.ts
import { Resend } from 'resend';
import { EmailTemplate } from 'resend/build/src/types';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@alumniconnect.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
  const subject = 'AlumniConnect – Verify Your Email';
  const html = `<p>Hello,</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`;
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html } as EmailTemplate);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  const subject = 'AlumniConnect – Password Reset Request';
  const html = `<p>Hello,</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`;
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html } as EmailTemplate);
};
