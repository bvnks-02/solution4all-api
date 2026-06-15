import express from "express";
import * as product from "./product.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { uploadMultipleFiles } from "../../../multer/multer.js";

const productRouter = express.Router();

const uploadFields = [{ name: "images", maxCount: 5 }];

productRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("admin"),
    uploadMultipleFiles(uploadFields, "products"),
    product.addProduct
  )
  .get(product.getAllProducts);

productRouter.get("/slug/:slug", product.getProductBySlug);

productRouter
  .route("/:id")
  .get(product.getSpecificProduct)
  .put(
    protectedRoutes,
    allowedTo("admin"),
    uploadMultipleFiles(uploadFields, "products"),
    product.updateProduct
  )
  .delete(
    protectedRoutes,
    allowedTo("admin"),
    product.deleteProduct
  );

export default productRouter;
