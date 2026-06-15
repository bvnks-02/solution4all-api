import { Schema, model } from "mongoose";

const contactSubmissionSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    department: {
      type: String,
      required: true,
      enum: ["general", "commercial", "ecommerce", "technical"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    source_page: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    ip_address: {
      type: String,
      trim: true,
      maxlength: 64,
      default: "",
    },
    user_agent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

contactSubmissionSchema.index({ status: 1, createdAt: -1 });

export const contactSubmissionModel = model("ContactSubmission", contactSubmissionSchema);
