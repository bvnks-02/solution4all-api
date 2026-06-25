import express from "express";
import { exportReport } from "./report.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const reportRouter = express.Router();
reportRouter.post("/export", protectedRoutes, allowedTo("admin", "user"), exportReport);
export default reportRouter;
