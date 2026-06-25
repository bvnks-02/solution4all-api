import express from "express";
import * as smtpConfig from "./smtpConfig.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const smtpRouter = express.Router();

smtpRouter
  .route("/")
  .get(protectedRoutes, allowedTo("admin"), smtpConfig.getSmtpConfig)
  .put(protectedRoutes, allowedTo("admin"), smtpConfig.updateSmtpConfig);

smtpRouter.post("/test", protectedRoutes, allowedTo("admin"), smtpConfig.testSmtpConfig);

export default smtpRouter;
