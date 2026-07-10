import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  product_id: { type: String, required: true },
  name_fr: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unit_price_dzd: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    customer_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customer_phone: {
      type: String,
      trim: true,
      default: "",
    },
    customer_company: {
      type: String,
      trim: true,
      default: "",
    },
    wilaya: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },
    subtotal_dzd: {
      type: Number,
      required: true,
      min: 0,
    },
    total_dzd: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      default: "boutique",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    admin_notes: {
      type: String,
      trim: true,
      default: "",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ order_number: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customer_email: 1 });
orderSchema.index({ archived: 1 });
orderSchema.index({ deletedAt: 1 });

export const orderModel = model("Order", orderSchema);
