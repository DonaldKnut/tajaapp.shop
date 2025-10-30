import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";

const addressSchema = new Schema({
  type: {
    type: String,
    enum: ["home", "work", "other"],
    required: true,
  },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "Nigeria" },
  postalCode: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (v: string) {
          // Require 8+ chars, uppercase, lowercase, number, and special char
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            v
          );
        },
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      },
      select: false, // Don't return password in queries by default
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      select: false,
    },
    phoneVerificationExpires: Date,
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: Date,
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^(\+234|0)[789]\d{9}$/,
        "Please enter a valid Nigerian phone number",
      ],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationData: {
      nin: String,
      ninVerified: { type: Boolean, default: false },
      selfieUrl: String,
      selfieVerified: { type: Boolean, default: false },
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      verifiedAt: Date,
      rejectionReason: String,
    },
    addresses: [addressSchema],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      categories: [String],
    },
    fraudFlags: {
      suspiciousActivity: { type: Boolean, default: false },
      multipleAccounts: { type: Boolean, default: false },
      highCancellationRate: { type: Boolean, default: false },
      flaggedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      flaggedAt: Date,
      reason: String,
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned", "under_review"],
      default: "active",
    },
    lastLoginAt: Date,
    lastLoginIp: String,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ "verificationData.nin": 1 });
userSchema.index({ role: 1, isVerified: 1 });

// Virtual for user's shops
userSchema.virtual("shops", {
  ref: "Shop",
  localField: "_id",
  foreignField: "owner",
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationData?.nin;
  return user;
};

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
export type { IUser } from "../types";
