import { Schema, model } from "mongoose";

const passwordResetTokenSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token_hash: {
    type: String,
    required: true,
    index: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  used_at: {
    type: Date,
    default: null,
  },
});

// TTL index — auto-deletes expired tokens
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const passwordResetTokenModel = model("PasswordResetToken", passwordResetTokenSchema);
