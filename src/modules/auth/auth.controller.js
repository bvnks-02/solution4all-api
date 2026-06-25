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

  const user = await userModel.findOne({ email });
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

const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  // Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send reset email
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  
  const emailContent = passwordResetEmail(resetUrl, user.name);
  await sendMail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email address",
  });
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now log in.",
  });
});

const activateAccount = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required to activate your account", 400));
  }

  const user = await userModel.findOne({
    activationToken: token,
    activationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Activation link is invalid or has expired", 400));
  }

  user.password = password;
  user.status = "active";
  user.activationToken = undefined;
  user.activationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Account activated successfully. You can now log in.",
  });
});

export { signIn, authRefresh, protectedRoutes, allowedTo, forgotPassword, resetPassword, activateAccount };
