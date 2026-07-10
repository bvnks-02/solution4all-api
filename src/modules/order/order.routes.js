import express from "express";
import * as order from "./order.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { orderLimiter } from "../../middlewares/rateLimiter.js";

const orderRouter = express.Router();

// Public: create order (rate limited)
orderRouter.post("/", orderLimiter, order.createOrder);

// Admin/User: list all orders
orderRouter.get("/", protectedRoutes, allowedTo("admin", "user"), order.getAllOrders);

// Admin: soft delete, trash, restore, hard delete
orderRouter.get("/trash", protectedRoutes, allowedTo("admin"), order.getTrashedOrders);
orderRouter.patch("/:id/restore", protectedRoutes, allowedTo("admin"), order.restoreOrder);
orderRouter.delete("/:id/hard", protectedRoutes, allowedTo("admin"), order.hardDeleteOrder);

// Admin/User: get/update specific order
orderRouter
  .route("/:id")
  .get(protectedRoutes, allowedTo("admin", "user"), order.getSpecificOrder)
  .patch(protectedRoutes, allowedTo("admin", "user"), order.updateOrder)
  .delete(protectedRoutes, allowedTo("admin"), order.deleteOrder);

export default orderRouter;
