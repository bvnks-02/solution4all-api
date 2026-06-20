import nodemailer from "nodemailer";

let transporter = null;

// SMTP credentials hardcoded per the verified nodetest.js script.
// Backend is lightweight and trusted — no env-var indirection.
const SMTP_HOST = "smtp.solution4all.dz";
const SMTP_PORT = 465;
const SMTP_SECURE = true;
const SMTP_USER = "websales@solution4all.dz";
const SMTP_PASS = "solutionadmin@2";
const SMTP_FROM = "websales@solution4all.dz";

export function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const from = SMTP_FROM;
  const mailTransporter = getTransporter();

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
