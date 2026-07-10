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
    allowedTo("admin", "user"),
    uploadMultipleFiles(uploadFields, "products"),
    product.addProduct
  )
  .get(product.getAllProducts);

productRouter.get("/slug/:slug", product.getProductBySlug);

productRouter.get("/trash", protectedRoutes, allowedTo("admin"), product.getTrashedProducts);
productRouter.patch("/:id/restore", protectedRoutes, allowedTo("admin"), product.restoreProduct);
productRouter.delete("/:id/hard", protectedRoutes, allowedTo("admin"), product.hardDeleteProduct);
productRouter.delete("/:id/force", protectedRoutes, allowedTo("admin"), product.forceDeleteProduct);

productRouter
  .route("/:id")
  .get(product.getSpecificProduct)
  .put(
    protectedRoutes,
    allowedTo("admin", "user"),
    uploadMultipleFiles(uploadFields, "products"),
    product.updateProduct
  )
  .delete(
    protectedRoutes,
    allowedTo("admin"),
    product.deleteProduct
  );

export default productRouter;
