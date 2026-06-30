import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { userModel } from "../../../Database/models/user.model.js";

const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await userModel.find().select("-password");

  res.status(200).json({ success: true, data: users });
});

const getUserById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, data: user });
});

const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  const user = await userModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, data: user });
});

const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, message: "User deleted successfully" });
});

const changePassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  const user = await userModel.findByIdAndUpdate(id, { password }, { new: true }).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ success: true, data: user });
});

const createUser = catchAsyncError(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  if (!email || !name || !password) {
    return next(new AppError("Name, Email and Password are required fields", 400));
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Admin-created members are active immediately — no activation email/invitation.
  const user = await userModel.create({
    name,
    email,
    password,
    role: role || "user",
    status: "active",
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

const changeMyPassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Current password and new password are required", 400));
  }

  // ⚠️ SECURITY: password has select:false — must explicitly include it
  const user = await userModel.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.correctPassword(currentPassword)) {
    return next(new AppError("Incorrect current password", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export { getAllUsers, getUserById, updateUser, deleteUser, changePassword, createUser, changeMyPassword };
