import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { parseSort } from "../../utils/parseSort.js";
import { paginate } from "../../utils/paginate.js";
import { productModel } from "../../../Database/models/product.model.js";

const addProduct = catchAsyncError(async (req, res, next) => {
  if (req.files) {
    if (req.files.images) {
      req.body.images = req.files.images.map((f) => f.filename);
    }
  }

  if (req.body.name_fr) {
    req.body.slug = slugify(req.body.name_fr, { lower: true, strict: true });
  }

  const product = new productModel(req.body);
  await product.save();

  res.status(201).json({ success: true, data: product });
});

const getAllProducts = catchAsyncError(async (req, res, next) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.active !== undefined) query.active = req.query.active === "true";
  if (req.query.featured !== undefined) query.featured = req.query.featured === "true";
  if (req.query.search) {
    const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name_fr: { $regex: escaped, $options: "i" } },
      { description_fr: { $regex: escaped, $options: "i" } },
    ];
  }
  const sort = parseSort(req.query.sort);
  const { items, meta } = await paginate(productModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const getProductBySlug = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;
  const product = await productModel.findOne({ slug });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: product });
});

const getSpecificProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: product });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (req.files) {
    if (req.files.images) {
      req.body.images = req.files.images.map((f) => f.filename);
    }
  }

  if (req.body.name_fr) {
    req.body.slug = slugify(req.body.name_fr, { lower: true, strict: true });
  }

  // Handle removed images
  if (req.body.removedImages) {
    try {
      const removed = JSON.parse(req.body.removedImages);
      if (Array.isArray(removed) && removed.length > 0) {
        // Get current product to access existing images
        const currentProduct = await productModel.findById(id);
        if (currentProduct) {
          const existingImages = currentProduct.images || [];
          const keptImages = existingImages.filter(name => !removed.includes(name));
          req.body.images = [...keptImages, ...(req.body.images || [])];
        }
      }
    } catch (e) {
      // Invalid JSON - ignore
    }
    delete req.body.removedImages;
  }

  const product = await productModel.findByIdAndUpdate(id, req.body, { new: true });

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, data: product });
});

const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findByIdAndDelete(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

export {
  addProduct,
  getAllProducts,
  getProductBySlug,
  getSpecificProduct,
  updateProduct,
  deleteProduct,
};
