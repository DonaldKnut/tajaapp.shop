import mongoose, { Schema } from "mongoose";
import { IReview } from "../types";

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
    },
    images: [String],
    response: {
      comment: {
        type: String,
        maxlength: [500, "Response cannot exceed 500 characters"],
      },
      respondedAt: Date,
    },
    helpful: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["published", "pending", "hidden"],
      default: "published",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ shop: 1, status: 1 });
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpful: 1 });

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true });

// Virtual for helpfulness score
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpful.length;
});

// Virtual for has response
reviewSchema.virtual("hasResponse").get(function () {
  return !!(this.response && this.response.comment);
});

// Pre-save middleware
reviewSchema.pre("save", function (next) {
  // Ensure review has either title or comment
  if (!this.title && !this.comment) {
    return next(new Error("Review must have either title or comment"));
  }
  next();
});

// Post-save middleware to update shop stats
reviewSchema.post("save", async function () {
  if (this.status === "published") {
    const Shop = mongoose.model("Shop");
    const shop = await Shop.findById(this.shop);
    if (shop) {
      await shop.updateStats();
    }
  }
});

// Post-remove middleware to update shop stats
reviewSchema.post("remove", async function () {
  const Shop = mongoose.model("Shop");
  const shop = await Shop.findById(this.shop);
  if (shop) {
    await shop.updateStats();
  }
});

// Static methods
reviewSchema.statics.getShopReviews = function (
  shopId: string,
  page = 1,
  limit = 10,
  rating?: number
) {
  const query: any = { shop: shopId, status: "published" };
  if (rating) {
    query.rating = rating;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate("reviewer", "fullName avatar")
    .populate("product", "title images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getProductReviews = function (
  productId: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  return this.find({ product: productId, status: "published" })
    .populate("reviewer", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getReviewStats = function (shopId: string) {
  return this.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(shopId),
        status: "published",
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ["$averageRating", 1] },
        ratingDistribution: {
          5: {
            $size: {
              $filter: {
                input: "$ratingDistribution",
                cond: { $eq: ["$$this", 5] },
              },
            },
          },
          4: {
            $size: {
              $filter: {
                input: "$ratingDistribution",
                cond: { $eq: ["$$this", 4] },
              },
            },
          },
          3: {
            $size: {
              $filter: {
                input: "$ratingDistribution",
                cond: { $eq: ["$$this", 3] },
              },
            },
          },
          2: {
            $size: {
              $filter: {
                input: "$ratingDistribution",
                cond: { $eq: ["$$this", 2] },
              },
            },
          },
          1: {
            $size: {
              $filter: {
                input: "$ratingDistribution",
                cond: { $eq: ["$$this", 1] },
              },
            },
          },
        },
      },
    },
  ]);
};

// Instance methods
reviewSchema.methods.addResponse = function (responseComment: string) {
  this.response = {
    comment: responseComment,
    respondedAt: new Date(),
  };
  return this.save();
};

reviewSchema.methods.toggleHelpful = function (userId: string) {
  const helpfulIndex = this.helpful.indexOf(userId);
  if (helpfulIndex > -1) {
    // Remove from helpful
    this.helpful.splice(helpfulIndex, 1);
  } else {
    // Add to helpful
    this.helpful.push(userId);
  }
  return this.save();
};

reviewSchema.methods.isHelpfulByUser = function (userId: string): boolean {
  return this.helpful.includes(userId);
};

reviewSchema.methods.canBeEditedBy = function (userId: string): boolean {
  return this.reviewer.toString() === userId && this.status === "published";
};

export const Review = mongoose.model<IReview>("Review", reviewSchema);



