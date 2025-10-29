import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../types";

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    type: {
      type: String,
      enum: ["payment", "payout", "refund", "fee"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    gateway: {
      type: String,
      enum: ["flutterwave", "paystack"],
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
    description: {
      type: String,
      required: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ gateway: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual("formattedAmount").get(function () {
  return `₦${this.amount.toLocaleString("en-NG")}`;
});

// Static methods
transactionSchema.statics.findByReference = function (reference: string) {
  return this.findOne({ reference })
    .populate("user", "fullName email")
    .populate("order", "orderNumber");
};

transactionSchema.statics.getUserTransactions = function (
  userId: string,
  type?: string,
  page = 1,
  limit = 20
) {
  const query: any = { user: userId };
  if (type && type !== "all") {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate("order", "orderNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

transactionSchema.statics.getTransactionStats = function (
  userId: string,
  period: "day" | "week" | "month" | "year" = "month"
) {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "day":
      startDate.setDate(now.getDate() - 1);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        status: "successful",
      },
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);
};

// Instance methods
transactionSchema.methods.updateStatus = function (
  status: string,
  gatewayResponse?: any
) {
  this.status = status;
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

transactionSchema.methods.markAsSuccessful = function (gatewayResponse?: any) {
  return this.updateStatus("successful", gatewayResponse);
};

transactionSchema.methods.markAsFailed = function (gatewayResponse?: any) {
  return this.updateStatus("failed", gatewayResponse);
};

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);



