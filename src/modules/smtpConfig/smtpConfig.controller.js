import { smtpConfigModel } from "../../../Database/models/smtpConfig.model.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";

export const getSmtpConfig = catchAsyncError(async (req, res, next) => {
  const config = await smtpConfigModel.findOne({ isActive: true });
  res.status(200).json({ success: true, data: config || null });
});

export const updateSmtpConfig = catchAsyncError(async (req, res, next) => {
  const { host, port, username, password, encryption, fromEmail } = req.body;

  if (!host || !port || !username || !password || !fromEmail) {
    return next(new AppError("All SMTP fields (host, port, username, password, fromEmail) are required", 400));
  }

  // Deactivate all existing config
  await smtpConfigModel.updateMany({}, { isActive: false });

  // Create new active config
  const config = await smtpConfigModel.create({
    host,
    port: Number(port),
    username,
    password,
    encryption: encryption || "TLS",
    fromEmail,
    isActive: true,
  });

  res.status(200).json({ success: true, data: config });
});
