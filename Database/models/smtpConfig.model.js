import { Schema, model } from "mongoose";

const smtpConfigSchema = new Schema(
  {
    host: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    encryption: {
      type: String,
      enum: ["TLS", "SSL", "none"],
      default: "TLS",
    },
    fromEmail: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const smtpConfigModel = model("SmtpConfig", smtpConfigSchema);
