import nodemailer from 'nodemailer';
import { transporter } from "../config/mail";
import { logger } from "./logger";

const FROM_EMAIL =
  process.env.EMAIL_FROM || "no-reply@alumniconnect.local";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

export const sendVerificationEmail = async (
  to: string,
  token: string
) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;

  try {
    if (!transporter) {
      console.error("✉️ Email service is unavailable – missing transporter.");
      return;
    }
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "AlumniConnect – Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;"
        >
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
  logger.info(`Sending email to ${to}...`);

  try {
    const info = await transporter.sendMail({
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

    logger.info("Email sent successfully");
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Ethereal Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}:`, error);
    throw error;
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

export const sendWelcomeEmail = async (to: string, name: string) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to AlumniConnect!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Welcome to AlumniConnect, ${name}!</h2>
          <p style="color: #555; text-align: center;">We are thrilled to have you join our community.</p>
          <p style="color: #555; text-align: center;">Connect with fellow students, look up alumni mentors, register for exclusive events, and search job listings.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">Thank you for being part of our network.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "AlumniConnect – Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
          <p style="color: #555; text-align: center;">Here is your one-time verification code (OTP). This code will expire in 10 minutes.</p>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px solid #ddd;">
            <h1 style="margin: 0; color: #2563eb; letter-spacing: 5px; font-size: 36px;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }
};

export const sendNotificationEmail = async (to: string, subject: string, message: string) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `AlumniConnect Notification: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">New Notification</h2>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h4 style="margin: 0 0 10px 0; color: #333;">${subject}</h4>
            <p style="margin: 0; color: #555; line-height: 1.5;">${message}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${FRONTEND_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block;">View in App</a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
};