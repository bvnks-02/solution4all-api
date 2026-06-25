import express from "express";
import * as smtpConfig from "./smtpConfig.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const smtpRouter = express.Router();

smtpRouter
  .route("/")
  .get(protectedRoutes, allowedTo("admin"), smtpConfig.getSmtpConfig)
  .post(protectedRoutes, allowedTo("admin"), smtpConfig.updateSmtpConfig);

export default smtpRouter;
