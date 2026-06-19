import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "no-reply@alumniconnect.com";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

export const sendVerificationEmail = async (
  to: string,
  token: string
) => {
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

export const sendPasswordResetEmail = async (
  to: string,
  token: string
) => {
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

export const sendEventRegistrationConfirmation = async (
  to: string,
  eventTitle: string,
  registrationId: string
) => {
  if (!resend) {
    console.log(`[Email Mock] Event confirmation to ${to} for "${eventTitle}" (RegID: ${registrationId})`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Registered: ${eventTitle}`,
    html: `
      <h3>Registration Confirmed!</h3>
      <p>You have registered for <strong>${eventTitle}</strong>.</p>
      <p>Your Registration ID is: <strong>${registrationId}</strong></p>
      <p>Present your event pass QR code at the venue on the event day.</p>
    `,
  });
};