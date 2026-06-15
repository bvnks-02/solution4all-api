import express from "express";
import * as analytics from "./analyticsEvent.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { analyticsLimiter } from "../../middlewares/rateLimiter.js";

const analyticsRouter = express.Router();

// Public: create event (rate limited)
analyticsRouter.post("/", analyticsLimiter, analytics.createEvent);

// Admin: list and count
analyticsRouter.get("/count", protectedRoutes, allowedTo("admin"), analytics.getEventCount);
analyticsRouter.get("/", protectedRoutes, allowedTo("admin"), analytics.getAllEvents);

export default analyticsRouter;
