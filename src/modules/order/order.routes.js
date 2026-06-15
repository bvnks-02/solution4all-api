import express from "express";
import * as order from "./order.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { orderLimiter } from "../../middlewares/rateLimiter.js";

const orderRouter = express.Router();

// Public: create order (rate limited)
orderRouter.post("/", orderLimiter, order.createOrder);

// Admin: list all orders
orderRouter.get("/", protectedRoutes, allowedTo("admin"), order.getAllOrders);

// Admin: get/update specific order
orderRouter
  .route("/:id")
  .get(protectedRoutes, allowedTo("admin"), order.getSpecificOrder)
  .patch(protectedRoutes, allowedTo("admin"), order.updateOrder);

export default orderRouter;
