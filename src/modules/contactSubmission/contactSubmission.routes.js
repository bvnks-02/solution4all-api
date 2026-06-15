import express from "express";
import * as submission from "./contactSubmission.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { contactLimiter } from "../../middlewares/rateLimiter.js";

const contactRouter = express.Router();

// Public: create submission (rate limited)
contactRouter.post("/", contactLimiter, submission.createSubmission);

// Admin: list, count, get, update, delete
contactRouter.get("/count", protectedRoutes, allowedTo("admin"), submission.getSubmissionCount);
contactRouter.get("/", protectedRoutes, allowedTo("admin"), submission.getAllSubmissions);
contactRouter
  .route("/:id")
  .get(protectedRoutes, allowedTo("admin"), submission.getSpecificSubmission)
  .patch(protectedRoutes, allowedTo("admin"), submission.updateSubmission)
  .delete(protectedRoutes, allowedTo("admin"), submission.deleteSubmission);

export default contactRouter;
