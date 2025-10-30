import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import Product from "../models/Product";

const router = express.Router();

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const productData = {
      ...req.body,
      seller: req.user._id,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  })
);

// @desc    Get all products (with search and filters)
// @route   GET /api/products
// @access  Public
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const condition = req.query.condition as string;
    const minPrice = parseInt(req.query.minPrice as string);
    const maxPrice = parseInt(req.query.maxPrice as string);
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

    let query: any = { status: "active" };

    // Search functionality
    if (search) {
      query = {
        ...query,
        $text: { $search: search },
      };
    }

    // Filters
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const sort = search
      ? { score: { $meta: "textScore" } }
      : { [sortBy]: sortOrder };

    const products = await Product.find(
      query,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .populate(
        "shop",
        "shopName shopSlug verification.isVerified stats.averageRating"
      )
      .skip(skip)
      .limit(limit)
      .sort(sort as any);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
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

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 12;

    const products = await Product.findFeatured(limit);

    res.json({
      success: true,
      data: products,
    });
  })
);

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
      .populate("shop", "shopName shopSlug logo verification stats")
      .populate("seller", "fullName avatar isVerified");

    if (!product) {
      throw new ApiErrorClass("Product not found", 404);
    }

    // Increment view count
    await product.incrementViews();

    res.json({
      success: true,
      data: product,
    });
  })
);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product Owner)
router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiErrorClass("Product not found", 404);
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiErrorClass("Not authorized to update this product", 403);
    }

    const allowedUpdates = [
      "title",
      "description",
      "category",
      "subcategory",
      "condition",
      "price",
      "compareAtPrice",
      "images",
      "videos",
      "specifications",
      "inventory",
      "shipping",
      "seo",
      "status",
      "featured",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  })
);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product Owner)
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiErrorClass("Product not found", 404);
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiErrorClass("Not authorized to delete this product", 403);
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  })
);

export default router;



