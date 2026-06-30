import { smtpConfigModel } from "../../../Database/models/smtpConfig.model.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { sendTestMail, resetTransporter } from "../../services/mailer.js";

export const getSmtpConfig = catchAsyncError(async (req, res, next) => {
  const config = await smtpConfigModel.findOne({ isActive: true });
  if (!config) return res.status(200).json({ success: true, data: null });
  res.status(200).json({
    success: true,
    data: {
      host: config.host,
      port: config.port,
      username: config.username,
      password: "••••••••",
      encryption: config.encryption,
      fromEmail: config.fromEmail,
      updatedAt: config.updatedAt,
    },
  });
});

export const updateSmtpConfig = catchAsyncError(async (req, res, next) => {
  const { host, port, username, password, encryption, fromEmail } = req.body;

  if (!host || !port || !username || !password || !fromEmail) {
    return next(new AppError("All SMTP fields (host, port, username, password, fromEmail) are required", 400));
  }

  // Clear existing active configs
  await smtpConfigModel.updateMany({}, { isActive: false });

  // Upsert as new active config
  const config = await smtpConfigModel.create({
    host,
    port: Number(port),
    username,
    password,
    encryption: encryption || "TLS",
    fromEmail,
    isActive: true,
  });

  // ⚠️ SECURITY: invalidate cached transporter so new creds take effect immediately
  resetTransporter();

  res.status(200).json({
    success: true,
    data: {
      host: config.host,
      port: config.port,
      username: config.username,
      password: "••••••••",
      encryption: config.encryption,
      fromEmail: config.fromEmail,
      updatedAt: config.updatedAt,
    },
  });
});

const MASKED_PASSWORD = "••••••••";

export const testSmtpConfig = catchAsyncError(async (req, res, next) => {
  let { host, port, username, password, encryption, fromEmail, to } = req.body;

  if (!host || !port || !username || !fromEmail) {
    return next(new AppError("Champs SMTP requis manquants (host, port, username, fromEmail)", 400));
  }

  // The form masks the saved password — if it wasn't re-typed, reuse the stored one.
  if (!password || password === MASKED_PASSWORD) {
    const saved = await smtpConfigModel.findOne({ isActive: true }).select("+password");
    if (saved && saved.password) {
      password = saved.password;
    } else {
      return next(new AppError("Mot de passe SMTP requis pour le test", 400));
    }
  }

  // Recipient defaults to the connection email (fromEmail).
  const recipient = (to && to.trim()) || fromEmail;

  try {
    await sendTestMail({ host, port, username, password, encryption, fromEmail }, recipient);
    res.status(200).json({ success: true, message: `Email de test envoyé à ${recipient}` });
  } catch (err) {
    return next(new AppError(`Échec de l'envoi du test : ${err.message}`, 500));
  }
});
