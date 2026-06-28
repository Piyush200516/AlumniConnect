import nodemailer from "nodemailer";

const FROM_EMAIL =
  process.env.EMAIL_FROM || "no-reply@alumniconnect.com";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (
  to: string,
  token: string
) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "AlumniConnect – Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p style="color: #555; text-align: center;">Hello,</p>
          <p style="color: #555; text-align: center;">Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string
) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "AlumniConnect – Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #555; text-align: center;">Hello,</p>
          <p style="color: #555; text-align: center;">We received a request to reset your password. Click the button below to choose a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #555; text-align: center;">This link will expire in 15 minutes.</p>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

export const sendEventRegistrationConfirmation = async (
  to: string,
  eventTitle: string,
  registrationId: string
) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `Registered: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Registration Confirmed!</h2>
          <p style="color: #555; text-align: center;">You have successfully registered for <strong>${eventTitle}</strong>.</p>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px solid #ddd;">
            <p style="margin: 0; color: #555;">Your Registration ID is:</p>
            <h3 style="margin: 10px 0; color: #2563eb;">${registrationId}</h3>
          </div>
          <p style="color: #555; text-align: center;">Please present your event pass QR code at the venue on the event day.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send event confirmation email:", error);
  }
};