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
      select: false, // ⚠️ SECURITY: never leak in queries
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

smtpConfigSchema.statics.getConfig = function () {
  return this.findOne({ isActive: true }).select("+password");
};

export const smtpConfigModel = model("SmtpConfig", smtpConfigSchema);
