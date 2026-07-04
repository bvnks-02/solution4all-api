import nodemailer from "nodemailer";
import { smtpConfigModel } from "../../Database/models/smtpConfig.model.js";

let transporter = null;

/**
 * Builds nodemailer transport options from an SMTP config, deriving `secure`
 * from the PORT (not just the encryption label). Port 465 is implicit TLS and
 * MUST be `secure: true`; 587/25 use STARTTLS. Getting this wrong makes the
 * connection hang or silently misbehave, which is the classic "test says sent
 * but nothing arrives" failure.
 */
function buildTransportOptions({ host, port, username, password, encryption }) {
  const numericPort = Number(port);
  const secure = encryption === "SSL" || numericPort === 465;
  const requireTLS = !secure && encryption === "TLS";
  return {
    host,
    port: numericPort,
    secure,
    requireTLS,
    auth: { user: username, pass: password },
  };
}

export async function getTransporter() {
  if (transporter) return transporter;

  try {
    const activeConfig = await smtpConfigModel.findOne({ isActive: true }).select("+password");
    if (activeConfig) {
      transporter = nodemailer.createTransport(
        buildTransportOptions({
          host: activeConfig.host,
          port: activeConfig.port,
          username: activeConfig.username,
          password: activeConfig.password,
          encryption: activeConfig.encryption,
        }),
      );
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

  const testTransporter = nodemailer.createTransport(
    buildTransportOptions({ host, port, username, password, encryption }),
  );

  // Validate connection + authentication up front so a wrong host/port/password
  // surfaces as a real error instead of a false "sent" success.
  await testTransporter.verify();

  const info = await testTransporter.sendMail({
    from: fromEmail || username,
    to,
    subject: "Test de configuration SMTP — Solution4All",
    html: `<div style="font-family:Arial;padding:20px"><h2 style="color:#1C3F7A">Test SMTP réussi</h2><p>Ce message confirme que votre configuration SMTP fonctionne correctement.</p><p>— Solution4All</p></div>`,
  });

  // The server can accept the connection but refuse the recipient (relay denied,
  // unknown mailbox). Treat that as a failure so the admin isn't told it worked.
  if (info.rejected?.length || !info.accepted?.length) {
    throw new Error(
      `le serveur a refusé le destinataire ${to}${info.response ? ` (${info.response})` : ""}`,
    );
  }

  return info;
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
