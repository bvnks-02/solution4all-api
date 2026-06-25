import express from "express";
import * as User from "./user.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .get(protectedRoutes, allowedTo("admin"), User.getAllUsers)
  .post(protectedRoutes, allowedTo("admin"), User.createUser);

userRouter.patch("/change-my-password", protectedRoutes, User.changeMyPassword);

userRouter
  .route("/:id")
  .get(protectedRoutes, allowedTo("admin"), User.getUserById)
  .put(protectedRoutes, allowedTo("admin"), User.updateUser)
  .delete(protectedRoutes, allowedTo("admin"), User.deleteUser)
  .patch(protectedRoutes, allowedTo("admin"), User.changePassword);

export default userRouter;
