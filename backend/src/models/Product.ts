import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    subcategory: String,
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    videos: [
      {
        url: String,
        thumbnail: String,
        duration: Number, // in seconds
        type: {
          type: String,
          enum: ["video"],
          default: "video",
        },
      },
    ],
    specifications: {
      brand: String,
      size: String,
      color: String,
      material: String,
      gender: {
        type: String,
        enum: ["men", "women", "unisex", "kids"],
      },
    },
    inventory: {
      quantity: {
        type: Number,
        default: 1,
        min: [0, "Quantity cannot be negative"],
      },
      sku: String,
      trackQuantity: { type: Boolean, default: true },
    },
    shipping: {
      weight: Number, // in kg
      dimensions: {
        length: Number, // in cm
        width: Number,
        height: Number,
      },
      freeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0 },
      processingTime: {
        type: String,
        enum: ["1-2-days", "3-5-days", "1-week", "2-weeks"],
        default: "1-2-days",
      },
    },
    seo: {
      tags: [String],
      metaTitle: String,
      metaDescription: String,
    },
    status: {
      type: String,
      enum: ["active", "draft", "sold", "archived"],
      default: "active",
    },
    featured: { type: Boolean, default: false },
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ shop: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ condition: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ "specifications.brand": 1 });
productSchema.index({ "specifications.size": 1 });
productSchema.index({ "specifications.gender": 1 });
productSchema.index({ "seo.tags": 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "stats.views": -1 });

// Text search index
productSchema.index({
  title: "text",
  description: "text",
  category: "text",
  "seo.tags": "text",
  "specifications.brand": "text",
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
  }
  return 0;
});

// Virtual for availability
productSchema.virtual("inStock").get(function () {
  return this.inventory.trackQuantity ? this.inventory.quantity > 0 : true;
});

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return `₦${this.price.toLocaleString("en-NG")}`;
});

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Auto-generate SKU if not provided
  if (!this.inventory.sku) {
    this.inventory.sku = `${this.shop.toString().slice(-6)}-${Date.now()}`;
  }

  // Ensure at least one image
  if (!this.images || this.images.length === 0) {
    return next(new Error("At least one product image is required"));
  }

  // Validate compareAtPrice
  if (this.compareAtPrice && this.compareAtPrice <= this.price) {
    this.compareAtPrice = undefined;
  }

  next();
});

// Static methods
productSchema.statics.findByCategory = function (category: string, limit = 20) {
  return this.find({ category, status: "active" })
    .populate(
      "shop",
      "shopName shopSlug verification.isVerified stats.averageRating"
    )
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.findFeatured = function (limit = 12) {
  return this.find({ featured: true, status: "active" })
    .populate(
      "shop",
      "shopName shopSlug verification.isVerified stats.averageRating"
    )
    .sort({ "stats.views": -1 })
    .limit(limit);
};

productSchema.statics.searchProducts = function (
  query: string,
  filters: any = {}
) {
  const searchQuery: any = {
    $text: { $search: query },
    status: "active",
    ...filters,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .populate(
      "shop",
      "shopName shopSlug verification.isVerified stats.averageRating"
    )
    .sort({ score: { $meta: "textScore" } });
};

// Instance methods
productSchema.methods.incrementViews = function () {
  this.stats.views += 1;
  return this.save();
};

productSchema.methods.toggleLike = function (userId: string) {
  // This would typically be handled by a separate UserProductLike model
  // For now, just increment likes
  this.stats.likes += 1;
  return this.save();
};

productSchema.methods.checkAvailability = function (quantity = 1) {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity >= quantity;
};

export const Product = mongoose.model<IProduct>("Product", productSchema);
