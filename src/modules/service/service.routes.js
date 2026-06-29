import express from "express";
import * as service from "./service.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const serviceRouter = express.Router();

serviceRouter
  .route("/")
  .post(protectedRoutes, allowedTo("admin", "user"), service.addService)
  .get(service.getAllServices);

serviceRouter
  .route("/:id")
  .get(service.getSpecificService)
  .put(protectedRoutes, allowedTo("admin", "user"), service.updateService)
  .patch(protectedRoutes, allowedTo("admin", "user"), service.updateService)
  .delete(protectedRoutes, allowedTo("admin"), service.deleteService);

export default serviceRouter;
