import { Schema, model } from "mongoose";

const analyticsEventSchema = new Schema(
  {
    event_type: {
      type: String,
      required: true,
      enum: ["page_view", "cta_click", "form_submit", "form_success", "form_error", "service_view"],
    },
    page_path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    event_label: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    referrer: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2048,
    },
    session_id: {
      type: String,
      trim: true,
      default: "",
    },
    device_type: {
      type: String,
      enum: ["mobile", "tablet", "desktop", ""],
      default: "",
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ event_type: 1, createdAt: -1 });
analyticsEventSchema.index({ session_id: 1 });

export const analyticsEventModel = model("AnalyticsEvent", analyticsEventSchema);
