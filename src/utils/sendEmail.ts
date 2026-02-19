import nodemailer from "nodemailer";
import { envVars } from "../config/env";

interface EmailOptions {

  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST,
  port: parseInt(envVars.SMTP_PORT),
  secure: envVars.SMTP_PORT === "465", 
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
});

/**
 * Send an email using the configured SMTP transport.
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"${envVars.SMTP_FROM_NAME}" <${envVars.SMTP_FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

/**
 * Build and send a password-reset email with a reset link.
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${envVars.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px;">
        You requested a password reset. Click the button below to reset your password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #4CAF50; color: white; padding: 14px 28px;
                  text-decoration: none; border-radius: 5px; font-size: 16px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #555; font-size: 14px;">
        If you didn't request this, you can safely ignore this email. This link will expire in
        <strong>${envVars.JWT_RESET_EXPIRES_IN}</strong>.
      </p>
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #4CAF50;">${resetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Store Management. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: "Password Reset Request",
    html,
  });
};
