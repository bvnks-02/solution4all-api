import express from "express";
import * as auth from "./auth.controller.js";
import { protectedRoutes } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";

const authRouter = express.Router();

authRouter.post("/signin", authLimiter, auth.signIn);
authRouter.post("/refresh", protectedRoutes, auth.authRefresh);
authRouter.get("/me", protectedRoutes, auth.getMe);
authRouter.post("/forgot-password", auth.forgotPassword);
authRouter.post("/reset-password/:token", auth.resetPassword);
authRouter.post("/activate-account/:token", auth.activateAccount);
authRouter.post("/reset-password", auth.resetPassword);
authRouter.post("/activate-account", auth.activateAccount);
authRouter.patch("/change-password", protectedRoutes, auth.changePassword);
authRouter.post("/login-notification", protectedRoutes, auth.sendLoginNotification);

export default authRouter;
