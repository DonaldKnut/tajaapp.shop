import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem, IOrderTimeline } from "../types";

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, "Subtotal cannot be negative"],
  },
});

const orderTimelineSchema = new Schema<IOrderTimeline>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String,
});

const addressSchema = new Schema({
  type: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home",
  },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "Nigeria" },
  postalCode: String,
  isDefault: { type: Boolean, default: false },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    totals: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, "Subtotal cannot be negative"],
      },
      shippingCost: {
        type: Number,
        default: 0,
        min: [0, "Shipping cost cannot be negative"],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, "Tax cannot be negative"],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
      },
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
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "escrowed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "ussd"],
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
    },
    escrowStatus: {
      type: String,
      enum: ["pending", "funded", "released", "refunded"],
      default: "pending",
    },
    escrowReference: String,
    escrowCreatedAt: Date,
    escrowReleasedAt: Date,
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: addressSchema,
    delivery: {
      method: {
        type: String,
        enum: ["pickup", "delivery"],
        default: "delivery",
      },
      provider: {
        type: String,
        enum: ["gokada", "kwik", "bolt", "custom"],
      },
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      deliveryFee: {
        type: Number,
        default: 0,
        min: [0, "Delivery fee cannot be negative"],
      },
    },
    timeline: {
      type: [orderTimelineSchema],
      default: [],
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ shop: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ escrowStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    // Generate order number: TJS + timestamp + random
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.orderNumber = `TJS${timestamp.slice(-6)}${random}`;
  }

  // Add timeline entry for status changes
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`,
    });
  }

  next();
});

// Virtual for order age in days
orderSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for can be cancelled
orderSchema.virtual("canBeCancelled").get(function () {
  return ["pending", "confirmed"].includes(this.status);
});

// Virtual for can be refunded
orderSchema.virtual("canBeRefunded").get(function () {
  return ["delivered"].includes(this.status) && this.ageInDays <= 7;
});

// Static methods
orderSchema.statics.findByOrderNumber = function (orderNumber: string) {
  return this.findOne({ orderNumber })
    .populate("buyer", "fullName email phone avatar")
    .populate("seller", "fullName email phone avatar")
    .populate("shop", "shopName shopSlug logo")
    .populate("items.product", "title images");
};

orderSchema.statics.getOrdersByStatus = function (
  userId: string,
  status: string,
  userType: "buyer" | "seller" = "buyer"
) {
  const query = userType === "buyer" ? { buyer: userId } : { seller: userId };
  if (status !== "all") {
    query.status = status;
  }

  return this.find(query)
    .populate("buyer", "fullName email phone avatar")
    .populate("seller", "fullName email phone avatar")
    .populate("shop", "shopName shopSlug logo")
    .sort({ createdAt: -1 });
};

orderSchema.statics.getOrderStats = function (
  shopId: string,
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
        shop: new mongoose.Types.ObjectId(shopId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totals.total" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);
};

// Instance methods
orderSchema.methods.updateStatus = async function (
  newStatus: string,
  note?: string
) {
  const previousStatus = this.status;
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Order status updated to ${newStatus}`,
  });

  await this.save();

  // Update shop performance metrics when order status changes
  if (
    previousStatus !== newStatus &&
    (newStatus === "cancelled" || newStatus === "delivered")
  ) {
    try {
      const Shop = mongoose.model("Shop");
      const shop = await Shop.findById(this.shop);
      if (shop) {
        await shop.updatePerformanceMetrics();
      }
    } catch (error: any) {
      console.error(
        `[ERROR] Failed to update shop performance for order ${this.orderNumber}:`,
        error.message
      );
      // Don't throw - performance update failure shouldn't block order update
    }
  }

  return this;
};

orderSchema.methods.calculateTotals = function () {
  this.totals.subtotal = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );
  this.totals.total =
    this.totals.subtotal +
    this.totals.shippingCost +
    this.totals.tax -
    this.totals.discount;
  return this;
};

orderSchema.methods.canUpdateStatus = function (newStatus: string): boolean {
  const statusFlow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: [],
  };

  return statusFlow[this.status]?.includes(newStatus) || false;
};

export const Order = mongoose.model<IOrder>("Order", orderSchema);
