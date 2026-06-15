import { userModel } from "../../../Database/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import jwt from "jsonwebtoken";

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

export { signIn, authRefresh, protectedRoutes, allowedTo };
