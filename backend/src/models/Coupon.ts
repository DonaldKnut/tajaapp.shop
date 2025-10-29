import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IShop } from "./Shop";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number; // Percentage (1-100) or fixed amount
  shop?: IShop["_id"]; // If null, it's a platform-wide coupon
  createdBy: IUser["_id"];

  // Conditions
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  applicableCategories: string[];
  applicableProducts: string[];

  // Usage limits
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  currentUsageCount: number;

  // User tracking
  usedBy: Array<{
    user: IUser["_id"];
    usedAt: Date;
    orderAmount: number;
    discountAmount: number;
  }>;

  // Validity
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date;

  // Metadata
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isValid(): boolean;
  canBeUsedBy(
    userId: string,
    orderAmount: number
  ): { valid: boolean; reason?: string };
  calculateDiscount(orderAmount: number): number;
  markAsUsed(
    userId: string,
    orderAmount: number,
    discountAmount: number
  ): Promise<ICoupon>;
}

export interface ICouponModel extends mongoose.Model<ICoupon> {
  // Static methods
  findActiveCoupons(filters?: any): Promise<ICoupon[]>;
  findValidForUser(
    userId: string,
    orderAmount?: number,
    shopId?: string
  ): Promise<ICoupon[]>;
  generateUniqueCode(): Promise<string>;
  getUsageStats(couponId: string): Promise<any>;
  cleanupExpiredCoupons(): Promise<number>;
}

const couponUsageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
  orderAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
});

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      default: null, // null means platform-wide
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Conditions
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      default: null,
    },
    applicableCategories: [
      {
        type: String,
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Usage limits
    totalUsageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    perUserUsageLimit: {
      type: Number,
      default: 1,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },

    usedBy: [couponUsageSchema],

    // Validity
    isActive: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    // Metadata
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ shop: 1, isActive: 1 });
couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });
couponSchema.index({ createdBy: 1 });
couponSchema.index({ expiresAt: 1 });

// Virtuals
couponSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

couponSchema.virtual("isStarted").get(function () {
  return this.startsAt <= new Date();
});

couponSchema.virtual("usagePercentage").get(function () {
  if (!this.totalUsageLimit) return 0;
  return (this.currentUsageCount / this.totalUsageLimit) * 100;
});

// Instance Methods
couponSchema.methods.isValid = function (): boolean {
  const now = new Date();
  return (
    this.isActive &&
    this.startsAt <= now &&
    this.expiresAt > now &&
    (!this.totalUsageLimit || this.currentUsageCount < this.totalUsageLimit)
  );
};

couponSchema.methods.canBeUsedBy = function (
  userId: string,
  orderAmount: number
): { valid: boolean; reason?: string } {
  // Check if coupon is valid
  if (!this.isValid()) {
    return { valid: false, reason: "Coupon is not active or has expired" };
  }

  // Check minimum order amount
  if (this.minimumOrderAmount && orderAmount < this.minimumOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₦${this.minimumOrderAmount.toLocaleString()} required`,
    };
  }

  // Check per-user usage limit
  if (this.perUserUsageLimit) {
    const userUsageCount = this.usedBy.filter(
      (usage) => usage.user.toString() === userId
    ).length;

    if (userUsageCount >= this.perUserUsageLimit) {
      return {
        valid: false,
        reason: `You have already used this coupon ${this.perUserUsageLimit} time(s)`,
      };
    }
  }

  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (
  orderAmount: number
): number {
  let discount = 0;

  if (this.type === "percentage") {
    discount = (orderAmount * this.value) / 100;
  } else if (this.type === "fixed") {
    discount = Math.min(this.value, orderAmount);
  }

  // Apply maximum discount limit if set
  if (this.maximumDiscountAmount) {
    discount = Math.min(discount, this.maximumDiscountAmount);
  }

  return Math.round(discount);
};

couponSchema.methods.markAsUsed = async function (
  userId: string,
  orderAmount: number,
  discountAmount: number
): Promise<ICoupon> {
  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
    orderAmount,
    discountAmount,
  });

  this.currentUsageCount += 1;

  return await this.save();
};

// Static Methods
couponSchema.statics.findActiveCoupons = async function (
  filters = {}
): Promise<ICoupon[]> {
  const now = new Date();

  return await this.find({
    isActive: true,
    startsAt: { $lte: now },
    expiresAt: { $gt: now },
    $or: [
      { totalUsageLimit: null },
      { $expr: { $lt: ["$currentUsageCount", "$totalUsageLimit"] } },
    ],
    ...filters,
  }).sort({ createdAt: -1 });
};

couponSchema.statics.findValidForUser = async function (
  userId: string,
  orderAmount = 0,
  shopId?: string
): Promise<ICoupon[]> {
  const now = new Date();

  // Build base filter
  const filter: any = {
    isActive: true,
    startsAt: { $lte: now },
    expiresAt: { $gt: now },
    $or: [
      { totalUsageLimit: null },
      { $expr: { $lt: ["$currentUsageCount", "$totalUsageLimit"] } },
    ],
  };

  // Filter by shop (include platform-wide coupons)
  if (shopId) {
    filter.$or = [
      { shop: null }, // Platform-wide
      { shop: shopId },
    ];
  } else {
    filter.shop = null; // Only platform-wide
  }

  // If order amount is provided, filter by minimum order amount
  if (orderAmount > 0) {
    filter.$or = [
      { minimumOrderAmount: null },
      { minimumOrderAmount: { $lte: orderAmount } },
    ];
  }

  const coupons = await this.find(filter).sort({ value: -1, createdAt: -1 });

  // Filter out coupons that exceed per-user usage limit
  return coupons.filter((coupon) => {
    const userUsageCount = coupon.usedBy.filter(
      (usage) => usage.user.toString() === userId
    ).length;

    return (
      !coupon.perUserUsageLimit || userUsageCount < coupon.perUserUsageLimit
    );
  });
};

couponSchema.statics.generateUniqueCode = async function (): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    // Generate random alphanumeric code
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await this.exists({ code });
  } while (exists);

  return code;
};

couponSchema.statics.getUsageStats = async function (
  couponId: string
): Promise<any> {
  const coupon = await this.findById(couponId);
  if (!coupon) return null;

  const stats = {
    totalUsage: coupon.currentUsageCount,
    totalDiscount: coupon.usedBy.reduce(
      (sum, usage) => sum + usage.discountAmount,
      0
    ),
    averageOrderAmount: 0,
    averageDiscount: 0,
    usageByDay: {} as Record<string, number>,
    topUsers: [] as any[],
  };

  if (coupon.usedBy.length > 0) {
    stats.averageOrderAmount =
      coupon.usedBy.reduce((sum, usage) => sum + usage.orderAmount, 0) /
      coupon.usedBy.length;
    stats.averageDiscount = stats.totalDiscount / coupon.usedBy.length;

    // Group usage by day
    coupon.usedBy.forEach((usage) => {
      const day = usage.usedAt.toISOString().split("T")[0];
      stats.usageByDay[day] = (stats.usageByDay[day] || 0) + 1;
    });

    // Get top users
    const userUsage = new Map();
    coupon.usedBy.forEach((usage) => {
      const userId = usage.user.toString();
      if (!userUsage.has(userId)) {
        userUsage.set(userId, { count: 0, totalSpent: 0, totalDiscount: 0 });
      }
      const user = userUsage.get(userId);
      user.count += 1;
      user.totalSpent += usage.orderAmount;
      user.totalDiscount += usage.discountAmount;
    });

    stats.topUsers = Array.from(userUsage.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  return stats;
};

couponSchema.statics.cleanupExpiredCoupons =
  async function (): Promise<number> {
    const result = await this.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { isActive: false },
      }
    );

    return result.modifiedCount;
  };

// Pre-save validation
couponSchema.pre("save", function (next) {
  // Validate percentage value
  if (this.type === "percentage" && (this.value < 0 || this.value > 100)) {
    return next(new Error("Percentage value must be between 0 and 100"));
  }

  // Validate fixed value
  if (this.type === "fixed" && this.value < 0) {
    return next(new Error("Fixed value must be greater than 0"));
  }

  // Ensure expires date is in the future
  if (this.expiresAt <= this.startsAt) {
    return next(new Error("Expiry date must be after start date"));
  }

  next();
});

const Coupon = mongoose.model<ICoupon, ICouponModel>("Coupon", couponSchema);
export default Coupon;



