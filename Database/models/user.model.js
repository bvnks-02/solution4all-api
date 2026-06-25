import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // ⚠️ SECURITY: never leak in queries
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "active",
    },
    activationToken: String,
    activationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.isModified("password") && this.password) {
    this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
  }
});

userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(this._update.password, SALT_ROUNDS);
  }
});

userSchema.methods.correctPassword = function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compareSync(candidatePassword, this.password);
};

export const userModel = model("User", userSchema);
