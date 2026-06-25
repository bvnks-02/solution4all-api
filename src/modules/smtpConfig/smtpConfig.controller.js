import { smtpConfigModel } from "../../../Database/models/smtpConfig.model.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { sendMail, resetTransporter } from "../../services/mailer.js";

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

export const testSmtpConfig = catchAsyncError(async (req, res, next) => {
  try {
    await sendMail({
      to: req.user.email,
      subject: "Test de configuration SMTP — Solution4All",
      html: `<div style="font-family:Arial;padding:20px"><h2 style="color:#1C3F7A">Test SMTP réussi</h2><p>Bonjour ${req.user.name || ''},</p><p>Ce message confirme que votre configuration SMTP fonctionne correctement.</p><p>— Solution4All</p></div>`,
    });
    res.status(200).json({ success: true, message: `Email de test envoyé à ${req.user.email}` });
  } catch (err) {
    return next(new AppError(`Échec de l'envoi du test : ${err.message}`, 500));
  }
});
