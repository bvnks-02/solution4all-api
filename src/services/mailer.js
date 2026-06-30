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

/**
 * Sends a one-off test email using the provided SMTP config (NOT the cached
 * transporter), so it validates the exact values the admin is about to save.
 * Unlike sendMail, this rethrows on failure so the caller can surface the
 * real SMTP error to the user.
 */
export async function sendTestMail(config, to) {
  const { host, port, username, password, encryption, fromEmail } = config;
  const secure = encryption === "SSL";
  const requireTLS = encryption === "TLS";

  const testTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    requireTLS,
    auth: { user: username, pass: password },
  });

  return testTransporter.sendMail({
    from: fromEmail || username,
    to,
    subject: "Test de configuration SMTP — Solution4All",
    html: `<div style="font-family:Arial;padding:20px"><h2 style="color:#1C3F7A">Test SMTP réussi</h2><p>Ce message confirme que votre configuration SMTP fonctionne correctement.</p><p>— Solution4All</p></div>`,
  });
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
