import { userModel } from "../../../Database/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../../services/mailer.js";
import { passwordResetEmail, accountActivationEmail } from "../../services/emailTemplates.js";

const JWT_SECRET = process.env.JWT_SECRET || "solution4all-dev-secret";

const signToken = (user) => {
  return jwt.sign(
    { email: user.email, name: user.name, id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Token was not provided", 401);
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, JWT_SECRET);
};

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // ⚠️ SECURITY: password has select:false — must explicitly include it
  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !user.correctPassword(password)) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (user.status === "pending") {
    return next(new AppError("Your account is pending activation. Please check your email to set your password and activate your account.", 401));
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    data: {
      token,
      record: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        created: user.createdAt,
        updated: user.updatedAt,
      },
    },
  });
});

const authRefresh = catchAsyncError(async (req, res, next) => {
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const newToken = signToken(user);

  res.status(200).json({
    success: true,
    data: {
      token: newToken,
      record: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        created: user.createdAt,
        updated: user.updatedAt,
      },
    },
  });
});

const protectedRoutes = catchAsyncError(async (req, res, next) => {
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("Invalid user", 404));
  }

  req.user = user;
  next();
});

const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You are not authorized to access this route. Your role is ${req.user.role}`,
          403
        )
      );
    }
    next();
  });
};

// Reset tokens are stored on the User document (resetPasswordToken + resetPasswordExpires)
// rather than in a separate collection — simpler, no join needed, and the TTL is enforced
// by the expires field check in resetPassword. The dedicated passwordResetToken model was
// intentionally removed as dead code in favor of this approach.
const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await userModel.findOne({ email });

  // ⚠️ SECURITY: always return 200 — never reveal if email is registered (prevents enumeration)
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailContent = passwordResetEmail(resetUrl, user.name);
    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  res.status(200).json({
    success: true,
    message: "Si un compte correspond à cet email, un lien de réinitialisation a été envoyé.",
  });
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const token = req.params.token || req.body.token;
  const { password, new_password } = req.body;
  const pw = new_password || password;

  if (!pw) {
    return next(new AppError("Password is required", 400));
  }
  if (!isStrongPassword(pw)) {
    return next(new AppError("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre", 400));
  }

  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = pw;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour",
  });
});

const activateAccount = catchAsyncError(async (req, res, next) => {
  const token = req.params.token || req.body.token;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required to activate your account", 400));
  }
  if (!isStrongPassword(password)) {
    return next(new AppError("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre", 400));
  }

  const user = await userModel.findOne({
    activationToken: token,
    activationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Activation link is invalid or has expired", 400));
  }

  user.password = password;
  user.is_active = true;
  user.status = "active";
  user.activationToken = undefined;
  user.activationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Account activated successfully. You can now log in.",
  });
});

// Password strength: min 8, 1 uppercase, 1 digit
const isStrongPassword = (p) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);

const getMe = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({ success: true, data: user });
});

const changePassword = catchAsyncError(async (req, res, next) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return next(new AppError("Current password and new password are required", 400));
  }
  if (!isStrongPassword(new_password)) {
    return next(new AppError("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre", 400));
  }

  // ⚠️ SECURITY: password has select:false — must explicitly include it
  const user = await userModel.findById(req.user._id).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  if (!user.correctPassword(current_password)) {
    return next(new AppError("Mot de passe actuel incorrect", 401));
  }

  user.password = new_password;
  await user.save();

  res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
});

export { signIn, authRefresh, protectedRoutes, allowedTo, forgotPassword, resetPassword, activateAccount, changePassword, getMe, isStrongPassword };
