import { Schema, model } from "mongoose";

const serviceSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title_fr: {
      type: String,
      required: true,
      trim: true,
    },
    description_fr: {
      type: String,
      required: true,
      trim: true,
    },
    icon_name: {
      type: String,
      required: true,
      trim: true,
    },
    color_class: {
      type: String,
      trim: true,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

serviceSchema.index({ sort_order: 1, active: 1 });

export const serviceModel = model("Service", serviceSchema);
