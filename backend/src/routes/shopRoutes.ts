import express from "express";
import {
  protect,
  checkShopOwnership,
  optionalAuth,
} from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { Shop } from "../models/Shop";

const router = express.Router();

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { shopName, description, categories, shopSlug } = req.body;

    // Check if shop slug is available
    if (shopSlug) {
      const slugExists = await Shop.findOne({ shopSlug });
      if (slugExists) {
        throw new ApiErrorClass("Shop URL is already taken", 400);
      }
    }

    const shop = await Shop.create({
      owner: req.user._id,
      shopName,
      description,
      categories,
      shopSlug:
        shopSlug ||
        shopName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .substring(0, 30),
    });

    res.status(201).json({
      success: true,
      data: shop,
      message: "Shop created successfully",
    });
  })
);

// @desc    Get all shops (with search and filters)
// @route   GET /api/shops
// @access  Public
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const verified = req.query.verified as string;

    const query: any = { "settings.isActive": true };

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.categories = category;
    if (verified === "true") query["verification.isVerified"] = true;

    const skip = (page - 1) * limit;

    const shops = await Shop.find(query)
      .populate("owner", "fullName avatar isVerified")
      .skip(skip)
      .limit(limit)
      .sort({ "stats.averageRating": -1, createdAt: -1 });

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      data: {
        shops,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// @desc    Get shop by slug
// @route   GET /api/shops/:slug
// @access  Public
router.get(
  "/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ shopSlug: req.params.slug })
      .populate("owner", "fullName avatar isVerified createdAt")
      .populate({
        path: "products",
        match: { status: "active" },
        options: { limit: 12, sort: { createdAt: -1 } },
      });

    if (!shop) {
      throw new ApiErrorClass("Shop not found", 404);
    }

    res.json({
      success: true,
      data: shop,
    });
  })
);

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Shop Owner)
router.put(
  "/:shopId",
  protect,
  checkShopOwnership,
  asyncHandler(async (req, res) => {
    const allowedUpdates = [
      "shopName",
      "description",
      "categories",
      "logo",
      "banner",
      "socialLinks",
      "businessInfo",
      "settings",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.shop[field] = req.body[field];
      }
    });

    const updatedShop = await req.shop.save();

    res.json({
      success: true,
      data: updatedShop,
      message: "Shop updated successfully",
    });
  })
);

// @desc    Get shop analytics
// @route   GET /api/shops/:id/analytics
// @access  Private (Shop Owner)
router.get(
  "/:shopId/analytics",
  protect,
  checkShopOwnership,
  asyncHandler(async (req, res) => {
    const period = (req.query.period as string) || "month";

    // TODO: Implement detailed analytics
    const analytics = {
      overview: req.shop.stats,
      sales: [],
      traffic: [],
      topProducts: [],
    };

    res.json({
      success: true,
      data: analytics,
    });
  })
);

export default router;



