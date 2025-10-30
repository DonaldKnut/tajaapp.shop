import { Request, Response } from "express";
import { Review, Product, Shop, Order, User } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";

// @desc    Create a product review
// @route   POST /api/reviews/product/:productId
// @access  Private
export const createProductReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, title, comment, images } = req.body;
    const { productId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiErrorClass("Rating must be between 1 and 5", 400);
    }

    if (!title || !comment) {
      throw new ApiErrorClass("Title and comment are required", 400);
    }

    // Check if product exists
    const product = await Product.findById(productId).populate("shop");
    if (!product) {
      throw new ApiErrorClass("Product not found", 404);
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      buyer: req.user._id,
      "items.product": productId,
      status: "delivered",
    });

    if (!hasPurchased) {
      throw new ApiErrorClass(
        "You can only review products you have purchased and received",
        403
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      product: productId,
      type: "product",
    });

    if (existingReview) {
      throw new ApiErrorClass("You have already reviewed this product", 400);
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      product: productId,
      shop: product.shop._id,
      type: "product",
      rating,
      title,
      comment,
      images: images || [],
    });

    await review.populate([
      { path: "reviewer", select: "fullName avatar isVerified" },
      { path: "product", select: "title images" },
    ]);

    // Update product rating statistics
    await Product.updateRatingStats(productId);

    // Update shop rating statistics
    await Shop.updateRatingStats?.(product.shop._id as any);

    res.status(201).json({
      success: true,
      data: review,
      message: "Review created successfully",
    });
  }
);

// @desc    Create a shop review
// @route   POST /api/reviews/shop/:shopId
// @access  Private
export const createShopReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, title, comment } = req.body;
    const { shopId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiErrorClass("Rating must be between 1 and 5", 400);
    }

    if (!title || !comment) {
      throw new ApiErrorClass("Title and comment are required", 400);
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new ApiErrorClass("Shop not found", 404);
    }

    // Check if user has made a purchase from this shop
    const hasPurchased = await Order.findOne({
      buyer: req.user._id,
      seller: shop.owner,
      status: "delivered",
    });

    if (!hasPurchased) {
      throw new ApiErrorClass(
        "You can only review shops from which you have made a purchase",
        403
      );
    }

    // Check if user has already reviewed this shop
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      shop: shopId,
      type: "shop",
    });

    if (existingReview) {
      throw new ApiErrorClass("You have already reviewed this shop", 400);
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      shop: shopId,
      type: "shop",
      rating,
      title,
      comment,
    });

    await review.populate([
      { path: "reviewer", select: "fullName avatar isVerified" },
      { path: "shop", select: "shopName logo" },
    ]);

    // Update shop rating statistics
    await Shop.updateRatingStats(shopId);

    res.status(201).json({
      success: true,
      data: review,
      message: "Shop review created successfully",
    });
  }
);

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "newest";
    const rating = req.query.rating as string;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {
      product: productId,
      type: "product",
    };

    if (rating && rating !== "all") {
      filter.rating = parseInt(rating);
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    switch (sortBy) {
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "highest":
        sort = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sort = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sort = { helpfulVotes: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find(filter)
      .populate("reviewer", "fullName avatar isVerified")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: productId, type: "product" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach((stat) => {
      distribution[stat._id as keyof typeof distribution] = stat.count;
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        ratingDistribution: distribution,
      },
    });
  }
);

// @desc    Get shop reviews
// @route   GET /api/reviews/shop/:shopId
// @access  Public
export const getShopReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      shop: shopId,
      type: "shop",
    })
      .populate("reviewer", "fullName avatar isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      shop: shopId,
      type: "shop",
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, title, comment, images } = req.body;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiErrorClass("Review not found", 404);
    }

    // Check if user owns the review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      throw new ApiErrorClass("You can only update your own reviews", 403);
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Update rating statistics
    if (review.product) {
      await Product.updateRatingStats?.(review.product as any);
    }
    if (review.shop) {
      await Shop.updateRatingStats?.(review.shop as any);
    }

    await review.populate([
      { path: "reviewer", select: "fullName avatar isVerified" },
      { path: "product", select: "title images" },
      { path: "shop", select: "shopName logo" },
    ]);

    res.json({
      success: true,
      data: review,
      message: "Review updated successfully",
    });
  }
);

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiErrorClass("Review not found", 404);
    }

    // Check if user owns the review or is admin
    if (
      review.reviewer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiErrorClass("You can only delete your own reviews", 403);
    }

    const productId = review.product;
    const shopId = review.shop;

    await Review.findByIdAndDelete(reviewId);

    // Update rating statistics
    if (productId) {
      await Product.updateRatingStats?.(productId as any);
    }
    if (shopId) {
      await Shop.updateRatingStats?.(shopId as any);
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  }
);

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
export const markReviewHelpful = asyncHandler(
  async (req: Request, res: Response) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiErrorClass("Review not found", 404);
    }

    // Check if user has already marked this review as helpful
    const hasVoted = review.helpfulVotes.includes(req.user._id);

    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        (vote) => vote.toString() !== req.user._id.toString()
      );
    } else {
      // Add vote
      review.helpfulVotes.push(req.user._id);
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpful: !hasVoted,
        helpfulCount: review.helpfulVotes.length,
      },
      message: hasVoted ? "Vote removed" : "Review marked as helpful",
    });
  }
);

// @desc    Report review
// @route   POST /api/reviews/:reviewId/report
// @access  Private
export const reportReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { reason, details } = req.body;
    const { reviewId } = req.params;

    if (!reason) {
      throw new ApiErrorClass("Report reason is required", 400);
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiErrorClass("Review not found", 404);
    }

    // Check if user has already reported this review
    const hasReported = review.reports.some(
      (report) => report.reporter.toString() === req.user._id.toString()
    );

    if (hasReported) {
      throw new ApiErrorClass("You have already reported this review", 400);
    }

    // Add report
    review.reports.push({
      reporter: req.user._id,
      reason,
      reportedAt: new Date(),
    } as any);

    await review.save();

    res.json({
      success: true,
      message: "Review reported successfully",
    });
  }
);

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string; // 'product' or 'shop'
    const skip = (page - 1) * limit;

    const filter: any = { reviewer: req.user._id };
    if (type && ["product", "shop"].includes(type)) {
      filter.type = type;
    }

    const reviews = await Review.find(filter)
      .populate("product", "title images")
      .populate("shop", "shopName logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

// @desc    Get reviews that can be written (purchased but not reviewed)
// @route   GET /api/reviews/pending
// @access  Private
export const getPendingReviews = asyncHandler(
  async (req: Request, res: Response) => {
    // Get delivered orders by user
    const deliveredOrders = await Order.find({
      buyer: req.user._id,
      status: "delivered",
    }).populate("items.product seller");

    const pendingReviews = [];

    for (const order of deliveredOrders) {
      // Check product reviews
      for (const item of order.items) {
        const existingReview = await Review.findOne({
          reviewer: req.user._id,
          product: item.product._id,
          type: "product",
        });

        if (!existingReview) {
          pendingReviews.push({
            type: "product",
            orderId: order._id,
            orderNumber: order.orderNumber,
            product: item.product,
            deliveredAt: order.updatedAt,
          });
        }
      }

      // Check shop review
      const existingShopReview = await Review.findOne({
        reviewer: req.user._id,
        shop: (order as any).shop,
        type: "shop",
      });

      if (!existingShopReview) {
        const seller = await User.findById(order.seller).populate("shop");
        if (seller?.shop) {
          pendingReviews.push({
            type: "shop",
            orderId: order._id,
            orderNumber: order.orderNumber,
            shop: seller.shop,
            deliveredAt: order.updatedAt,
          });
        }
      }
    }

    res.json({
      success: true,
      data: pendingReviews,
    });
  }
);




