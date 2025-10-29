import { Request, Response } from "express";
import { Coupon, Shop, Product } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Seller/Admin)
export const createCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      code,
      type,
      value,
      title,
      description,
      minimumOrderAmount,
      maximumDiscountAmount,
      applicableCategories = [],
      applicableProducts = [],
      totalUsageLimit,
      perUserUsageLimit = 1,
      startsAt = new Date(),
      expiresAt,
      shopId,
    } = req.body;

    // Validate required fields
    if (!code || !type || !value || !title || !expiresAt) {
      throw new ApiErrorClass(
        "Code, type, value, title, and expiry date are required",
        400
      );
    }

    // If shopId is provided, verify user owns the shop
    if (shopId) {
      const shop = await Shop.findOne({ _id: shopId, owner: req.user._id });
      if (!shop) {
        throw new ApiErrorClass("Shop not found or access denied", 404);
      }
    } else {
      // Only admins can create platform-wide coupons
      if (req.user.role !== "admin") {
        throw new ApiErrorClass(
          "Only admins can create platform-wide coupons",
          403
        );
      }
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new ApiErrorClass("Coupon code already exists", 400);
    }

    // Validate products if specified
    if (applicableProducts.length > 0) {
      const products = await Product.find({
        _id: { $in: applicableProducts },
        ...(shopId && { shop: shopId }),
      });
      if (products.length !== applicableProducts.length) {
        throw new ApiErrorClass(
          "Some products not found or not owned by you",
          400
        );
      }
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      title,
      description,
      minimumOrderAmount,
      maximumDiscountAmount,
      applicableCategories,
      applicableProducts,
      totalUsageLimit,
      perUserUsageLimit,
      startsAt: new Date(startsAt),
      expiresAt: new Date(expiresAt),
      shop: shopId || null,
      createdBy: req.user._id,
    });

    await coupon.populate([
      { path: "shop", select: "shopName" },
      { path: "createdBy", select: "fullName" },
    ]);

    res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully",
    });
  }
);

// @desc    Get coupons (seller's own or all for admin)
// @route   GET /api/coupons
// @access  Private
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string; // 'active', 'expired', 'all'
  const shopId = req.query.shopId as string;

  const skip = (page - 1) * limit;

  // Build filter
  let filter: any = {};

  // Role-based filtering
  if (req.user.role === "admin") {
    // Admin can see all coupons
    if (shopId) {
      filter.shop = shopId;
    }
  } else {
    // Sellers can only see their own coupons
    const userShop = await Shop.findOne({ owner: req.user._id });
    if (!userShop) {
      return res.json({
        success: true,
        data: {
          coupons: [],
          pagination: { page, limit, total: 0, pages: 0 },
        },
      });
    }
    filter.shop = userShop._id;
  }

  // Status filtering
  if (status && status !== "all") {
    const now = new Date();
    if (status === "active") {
      filter.isActive = true;
      filter.startsAt = { $lte: now };
      filter.expiresAt = { $gt: now };
    } else if (status === "expired") {
      filter.$or = [{ isActive: false }, { expiresAt: { $lte: now } }];
    }
  }

  const coupons = await Coupon.find(filter)
    .populate("shop", "shopName")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Coupon.countDocuments(filter);

  res.json({
    success: true,
    data: {
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:couponId
// @access  Private
export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId)
    .populate("shop", "shopName")
    .populate("createdBy", "fullName")
    .populate("applicableProducts", "title images price");

  if (!coupon) {
    throw new ApiErrorClass("Coupon not found", 404);
  }

  // Check access (admin or owner)
  if (
    req.user.role !== "admin" &&
    coupon.createdBy._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiErrorClass("Access denied", 403);
  }

  // Get usage stats
  const stats = await Coupon.getUsageStats(couponId);

  res.json({
    success: true,
    data: {
      coupon,
      stats,
    },
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:couponId
// @access  Private
export const updateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { couponId } = req.params;
    const {
      title,
      description,
      minimumOrderAmount,
      maximumDiscountAmount,
      applicableCategories,
      applicableProducts,
      totalUsageLimit,
      perUserUsageLimit,
      expiresAt,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiErrorClass("Coupon not found", 404);
    }

    // Check access (admin or owner)
    if (
      req.user.role !== "admin" &&
      coupon.createdBy.toString() !== req.user._id.toString()
    ) {
      throw new ApiErrorClass("Access denied", 403);
    }

    // Don't allow changing core properties if coupon has been used
    if (coupon.currentUsageCount > 0) {
      const restrictedFields = ["type", "value", "code", "shop"];
      const providedFields = Object.keys(req.body);
      const hasRestrictedFields = restrictedFields.some((field) =>
        providedFields.includes(field)
      );

      if (hasRestrictedFields) {
        throw new ApiErrorClass(
          "Cannot modify core properties of a coupon that has been used",
          400
        );
      }
    }

    // Update allowed fields
    if (title) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (minimumOrderAmount !== undefined)
      coupon.minimumOrderAmount = minimumOrderAmount;
    if (maximumDiscountAmount !== undefined)
      coupon.maximumDiscountAmount = maximumDiscountAmount;
    if (applicableCategories)
      coupon.applicableCategories = applicableCategories;
    if (applicableProducts) coupon.applicableProducts = applicableProducts;
    if (totalUsageLimit !== undefined) coupon.totalUsageLimit = totalUsageLimit;
    if (perUserUsageLimit !== undefined)
      coupon.perUserUsageLimit = perUserUsageLimit;
    if (expiresAt) coupon.expiresAt = new Date(expiresAt);
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    await coupon.populate([
      { path: "shop", select: "shopName" },
      { path: "createdBy", select: "fullName" },
    ]);

    res.json({
      success: true,
      data: coupon,
      message: "Coupon updated successfully",
    });
  }
);

// @desc    Delete coupon
// @route   DELETE /api/coupons/:couponId
// @access  Private
export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiErrorClass("Coupon not found", 404);
    }

    // Check access (admin or owner)
    if (
      req.user.role !== "admin" &&
      coupon.createdBy.toString() !== req.user._id.toString()
    ) {
      throw new ApiErrorClass("Access denied", 403);
    }

    // Don't allow deletion if coupon has been used
    if (coupon.currentUsageCount > 0) {
      throw new ApiErrorClass("Cannot delete a coupon that has been used", 400);
    }

    await Coupon.findByIdAndDelete(couponId);

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  }
);

// @desc    Validate coupon for user
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, orderAmount, shopId, productIds = [] } = req.body;

    if (!code) {
      throw new ApiErrorClass("Coupon code is required", 400);
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    }).populate("applicableProducts", "category");

    if (!coupon) {
      return res.json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.json({
        success: false,
        message: "Coupon is not active or has expired",
      });
    }

    // Check if user can use this coupon
    const canUse = coupon.canBeUsedBy(req.user._id, orderAmount || 0);
    if (!canUse.valid) {
      return res.json({
        success: false,
        message: canUse.reason,
      });
    }

    // Check shop compatibility
    if (coupon.shop && shopId && coupon.shop.toString() !== shopId) {
      return res.json({
        success: false,
        message: "This coupon is not applicable to this shop",
      });
    }

    // Check product/category compatibility
    if (
      coupon.applicableProducts.length > 0 ||
      coupon.applicableCategories.length > 0
    ) {
      if (productIds.length === 0) {
        return res.json({
          success: false,
          message: "This coupon requires specific products",
        });
      }

      // Get products to check categories
      const products = await Product.find({ _id: { $in: productIds } });

      let isApplicable = false;

      // Check specific products
      if (coupon.applicableProducts.length > 0) {
        const applicableProductIds = coupon.applicableProducts.map((p) =>
          p._id.toString()
        );
        isApplicable = productIds.some((id: string) =>
          applicableProductIds.includes(id)
        );
      }

      // Check categories
      if (!isApplicable && coupon.applicableCategories.length > 0) {
        const productCategories = products.map((p) => p.category);
        isApplicable = productCategories.some((category) =>
          coupon.applicableCategories.includes(category)
        );
      }

      if (!isApplicable) {
        return res.json({
          success: false,
          message: "This coupon is not applicable to the selected products",
        });
      }
    }

    // Calculate discount
    const discountAmount = orderAmount
      ? coupon.calculateDiscount(orderAmount)
      : 0;

    res.json({
      success: true,
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          title: coupon.title,
          description: coupon.description,
        },
        discountAmount,
        finalAmount: orderAmount
          ? Math.max(0, orderAmount - discountAmount)
          : 0,
      },
      message: "Coupon is valid",
    });
  }
);

// @desc    Get available coupons for user
// @route   GET /api/coupons/available
// @access  Private
export const getAvailableCoupons = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderAmount, shopId } = req.query;

    const coupons = await Coupon.findValidForUser(
      req.user._id,
      orderAmount ? parseFloat(orderAmount as string) : undefined,
      shopId as string
    );

    // Calculate potential savings for each coupon
    const couponsWithSavings = coupons.map((coupon) => ({
      _id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      title: coupon.title,
      description: coupon.description,
      minimumOrderAmount: coupon.minimumOrderAmount,
      expiresAt: coupon.expiresAt,
      potentialSavings: orderAmount
        ? coupon.calculateDiscount(parseFloat(orderAmount as string))
        : 0,
    }));

    // Sort by potential savings (highest first)
    couponsWithSavings.sort((a, b) => b.potentialSavings - a.potentialSavings);

    res.json({
      success: true,
      data: couponsWithSavings,
    });
  }
);

// @desc    Generate unique coupon code
// @route   GET /api/coupons/generate-code
// @access  Private (Seller/Admin)
export const generateCouponCode = asyncHandler(
  async (req: Request, res: Response) => {
    const code = await Coupon.generateUniqueCode();

    res.json({
      success: true,
      data: { code },
    });
  }
);



