import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name_fr: {
      type: String,
      required: true,
      trim: true,
    },
    description_fr: {
      type: String,
      trim: true,
      default: "",
    },
    price_dzd: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "ordinateurs",
        "imprimantes",
        "onduleurs",
        "serveurs",
        "consommables",
        "logiciels",
        "licences",
      ],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ featured: -1, name_fr: 1 });

export const productModel = model("Product", productSchema);
