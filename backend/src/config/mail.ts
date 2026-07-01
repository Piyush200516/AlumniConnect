import nodemailer from 'nodemailer';

let actualTransporter: nodemailer.Transporter | null = null;
let initPromise: Promise<nodemailer.Transporter> | null = null;

/**
 * Gets or initializes the nodemailer Transporter.
 * 
 * PRODUCTION SETUP:
 * To switch from Ethereal Email to a real SMTP provider in production, you should:
 * 1. Set the NODE_ENV environment variable to 'production'.
 * 2. Set the following environment variables:
 *    - SMTP_HOST: The hostname of your SMTP server (e.g., smtp.gmail.com or smtp.sendgrid.net)
 *    - SMTP_PORT: The port number (usually 587 for TLS or 465 for SSL)
 *    - SMTP_SECURE: Set to 'true' if using SSL (port 465) or 'false' for TLS (port 587)
 *    - SMTP_USER: Your SMTP authentication username/email
 *    - SMTP_PASS: Your SMTP authentication password/API key
 *    - EMAIL_FROM: The verified sender email address
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (actualTransporter) return actualTransporter;
  if (!initPromise) {
    initPromise = (async () => {
      if (process.env.NODE_ENV === 'production') {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        const secure = process.env.SMTP_SECURE === 'true';
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        actualTransporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user && pass ? { user, pass } : undefined,
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        // Automatically create an Ethereal test account for local development
        const testAccount = await nodemailer.createTestAccount();
        actualTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      }
      return actualTransporter;
    })();
  }
  return initPromise;
}

// Export a custom transporter wrapper matching the required Nodemailer interface
export const transporter = {
  verify: async (): Promise<boolean> => {
    try {
      const t = await getTransporter();
      await t.verify();
      return true;
    } catch (error) {
      console.error('Failed to verify transporter connection:', error);
      throw error;
    }
  },
  sendMail: async (mailOptions: nodemailer.SendMailOptions): Promise<any> => {
    try {
      const t = await getTransporter();
      const info = await t.sendMail(mailOptions);
      
      console.log(`✉️ Email Sent. Message ID: ${info.messageId}`);
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`🔗 Ethereal Preview URL: ${previewUrl}`);
      }
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
} as unknown as nodemailer.Transporter;

