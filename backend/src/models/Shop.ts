import mongoose, { Schema, Model } from "mongoose";
import { IShop, IShopModel } from "../types";

const shopSchema = new Schema<IShop>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: [50, "Shop name cannot exceed 50 characters"],
    },
    shopSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9_-]+$/,
        "Shop URL can only contain lowercase letters, numbers, underscores and hyphens",
      ],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    logo: String,
    banner: String,
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    socialLinks: {
      instagram: String,
      whatsapp: String,
      twitter: String,
      facebook: String,
    },
    businessInfo: {
      businessType: {
        type: String,
        enum: ["individual", "business"],
        default: "individual",
      },
      businessName: String,
      businessAddress: String,
      cacNumber: String,
    },
    settings: {
      isActive: { type: Boolean, default: true },
      acceptsOrders: { type: Boolean, default: true },
      responseTime: {
        type: String,
        enum: ["within-hour", "within-day", "1-2-days", "3-5-days"],
        default: "within-day",
      },
      shippingMethods: [
        {
          type: String,
          enum: ["pickup", "delivery", "shipping"],
        },
      ],
      returnPolicy: {
        type: String,
        maxlength: [1000, "Return policy cannot exceed 1000 characters"],
        default: "No returns accepted",
      },
    },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    performanceMetrics: {
      totalOrders: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0, min: 0, max: 1 },
      averageDeliveryTime: { type: Number, default: 0 }, // in hours
      complaintsCount: { type: Number, default: 0 },
      disputesCount: { type: Number, default: 0 },
      disputesWon: { type: Number, default: 0 },
      disputesLost: { type: Number, default: 0 },
      refundCount: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      badge: {
        type: String,
        enum: ["basic", "trusted", "premium", null],
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
shopSchema.index({ owner: 1 });
shopSchema.index({ shopSlug: 1 });
shopSchema.index({ categories: 1 });
shopSchema.index({ "settings.isActive": 1 });
shopSchema.index({ "verification.isVerified": 1 });
shopSchema.index({ "stats.averageRating": -1 });
shopSchema.index({ createdAt: -1 });

// Virtual for shop's products
shopSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "shop",
});

// Virtual for shop URL
shopSchema.virtual("shopUrl").get(function () {
  return `taja.shop/${this.shopSlug}`;
});

// Pre-save middleware to generate slug if not provided
shopSchema.pre("save", function (next) {
  if (!this.shopSlug && this.shopName) {
    this.shopSlug = this.shopName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
  }
  next();
});

// Static method to check if slug is available
shopSchema.statics.isSlugAvailable = function (
  slug: string,
  excludeId?: string
) {
  const query: any = { shopSlug: slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return this.countDocuments(query).then((count: number) => count === 0);
};

// Method to update stats
shopSchema.methods.updateStats = async function () {
  const Product = mongoose.model("Product");
  const Order = mongoose.model("Order");
  const Review = mongoose.model("Review");

  // Count products
  const productCount = await Product.countDocuments({
    shop: this._id,
    status: "active",
  });

  // Calculate sales and earnings
  const salesData = await Order.aggregate([
    { $match: { shop: this._id, status: "delivered" } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalEarnings: { $sum: "$totals.total" },
      },
    },
  ]);

  // Calculate average rating
  const reviewData = await Review.aggregate([
    { $match: { shop: this._id, status: "published" } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  // Update stats
  this.stats.totalProducts = productCount;
  this.stats.totalSales = salesData[0]?.totalSales || 0;
  this.stats.totalEarnings = salesData[0]?.totalEarnings || 0;
  this.stats.averageRating =
    Math.round((reviewData[0]?.averageRating || 0) * 10) / 10;
  this.stats.totalReviews = reviewData[0]?.totalReviews || 0;

  await this.save();
};

// Method to update performance metrics
shopSchema.methods.updatePerformanceMetrics = async function () {
  const Order = mongoose.model("Order");

  // Get all orders for this shop
  const orders = await Order.find({ shop: this._id });

  if (orders.length === 0) {
    this.performanceMetrics.totalOrders = 0;
    this.performanceMetrics.cancelledOrders = 0;
    this.performanceMetrics.cancellationRate = 0;
    await this.save();
    return;
  }

  // Calculate metrics
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter(
    (o: any) => o.status === "cancelled"
  ).length;
  const cancellationRate = totalOrders > 0 ? cancelledOrders / totalOrders : 0;

  // Calculate average delivery time (for delivered orders)
  const deliveredOrders = orders.filter(
    (o: any) => o.status === "delivered" && o.updatedAt && o.createdAt
  );
  let totalDeliveryTime = 0;
  if (deliveredOrders.length > 0) {
    totalDeliveryTime = deliveredOrders.reduce((sum: number, order: any) => {
      const deliveryTime =
        (order.updatedAt.getTime() - order.createdAt.getTime()) /
        (1000 * 60 * 60); // hours
      return sum + deliveryTime;
    }, 0);
  }
  const averageDeliveryTime =
    deliveredOrders.length > 0 ? totalDeliveryTime / deliveredOrders.length : 0;

  // Update performance metrics
  this.performanceMetrics.totalOrders = totalOrders;
  this.performanceMetrics.cancelledOrders = cancelledOrders;
  this.performanceMetrics.cancellationRate =
    Math.round(cancellationRate * 100) / 100;
  this.performanceMetrics.averageDeliveryTime =
    Math.round(averageDeliveryTime * 10) / 10;
  this.performanceMetrics.lastUpdated = new Date();

  // Auto-suspend if performance is poor
  if (
    cancellationRate > 0.2 && // >20% cancellation rate
    totalOrders >= 5 // At least 5 orders to avoid false positives
  ) {
    if (this.settings.isActive) {
      this.settings.isActive = false;
      console.warn(
        `[AUTO-SUSPEND] Shop ${
          this.shopName
        } suspended due to high cancellation rate: ${(
          cancellationRate * 100
        ).toFixed(1)}%`
      );

      // Flag owner's user account
      const User = mongoose.model("User");
      await User.findByIdAndUpdate(this.owner, {
        $set: {
          "fraudFlags.highCancellationRate": true,
          accountStatus: "under_review",
        },
      });
    }
  }

  // Auto-unsuspend if performance improves
  if (
    !this.settings.isActive &&
    cancellationRate <= 0.15 && // <15% cancellation rate
    totalOrders >= 10 // At least 10 orders to confirm improvement
  ) {
    this.settings.isActive = true;
    console.info(
      `[AUTO-UNSUSPEND] Shop ${this.shopName} reactivated - performance improved`
    );
  }

  await this.save();
};

const Shop = mongoose.model<IShop, IShopModel>("Shop", shopSchema);
export default Shop;
