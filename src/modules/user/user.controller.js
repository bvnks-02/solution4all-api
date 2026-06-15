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

export { getAllUsers, getUserById, updateUser, deleteUser, changePassword };
