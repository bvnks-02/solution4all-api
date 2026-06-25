import nodemailer from "nodemailer";
import { smtpConfigModel } from "../../Database/models/smtpConfig.model.js";

let transporter = null;

export async function getTransporter() {
  if (transporter) return transporter;

  try {
    const activeConfig = await smtpConfigModel.findOne({ isActive: true }).select("+password");
    if (activeConfig) {
      const secure = activeConfig.encryption === "SSL";
      const requireTLS = activeConfig.encryption === "TLS";
      transporter = nodemailer.createTransport({
        host: activeConfig.host,
        port: activeConfig.port,
        secure,          // true only for SSL (port 465 implicit)
        requireTLS,      // STARTTLS for TLS (port 587)
        auth: {
          user: activeConfig.username,
          pass: activeConfig.password,
        },
      });
      return transporter;
    }
  } catch (err) {
    console.error("Failed to load SMTP config from DB:", err.message);
  }

  // Fallback to env vars (dev/CI)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.solution4all.dz",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER || "websales@solution4all.dz",
      pass: process.env.SMTP_PASS || "solutionadmin@2",
    },
  });
  return transporter;
}

export function resetTransporter() {
  transporter = null;
}

export async function sendMail({ to, subject, html, text }) {
  const mailTransporter = await getTransporter();
  let from = process.env.SMTP_FROM || "websales@solution4all.dz";

  try {
    const activeConfig = await smtpConfigModel.findOne({ isActive: true }).select("+password");
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
