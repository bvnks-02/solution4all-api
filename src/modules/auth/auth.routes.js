import express from "express";
import * as auth from "./auth.controller.js";
import { protectedRoutes } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";

const authRouter = express.Router();

authRouter.post("/signin", authLimiter, auth.signIn);
authRouter.post("/refresh", protectedRoutes, auth.authRefresh);
authRouter.post("/forgot-password", auth.forgotPassword);
authRouter.post("/reset-password/:token", auth.resetPassword);
authRouter.post("/activate-account/:token", auth.activateAccount);

export default authRouter;
