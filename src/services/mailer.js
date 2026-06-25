import nodemailer from "nodemailer";
import { smtpConfigModel } from "../../Database/models/smtpConfig.model.js";

// Hardcoded fallback credentials (default)
const DEFAULT_SMTP_HOST = "smtp.solution4all.dz";
const DEFAULT_SMTP_PORT = 465;
const DEFAULT_SMTP_SECURE = true;
const DEFAULT_SMTP_USER = "websales@solution4all.dz";
const DEFAULT_SMTP_PASS = "solutionadmin@2";
const DEFAULT_SMTP_FROM = "websales@solution4all.dz";

export async function getTransporter() {
  try {
    const activeConfig = await smtpConfigModel.findOne({ isActive: true });
    if (activeConfig) {
      const secure = activeConfig.encryption === "SSL" || activeConfig.port === 465;
      return nodemailer.createTransport({
        host: activeConfig.host,
        port: activeConfig.port,
        secure,
        auth: {
          user: activeConfig.username,
          pass: activeConfig.password,
        },
      });
    }
  } catch (err) {
    console.error("Failed to load active SMTP config from database, using defaults:", err.message);
  }

  // Fallback if no configuration is found in database
  return nodemailer.createTransport({
    host: DEFAULT_SMTP_HOST,
    port: DEFAULT_SMTP_PORT,
    secure: DEFAULT_SMTP_SECURE,
    auth: {
      user: DEFAULT_SMTP_USER,
      pass: DEFAULT_SMTP_PASS,
    },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const mailTransporter = await getTransporter();
  let from = DEFAULT_SMTP_FROM;

  try {
    const activeConfig = await smtpConfigModel.findOne({ isActive: true });
    if (activeConfig && activeConfig.fromEmail) {
      from = activeConfig.fromEmail;
    }
  } catch (err) {
    // Ignore error and use default fromEmail
  }

  try {
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    // Don't rethrow - callers handle their own error logging
  }
}
