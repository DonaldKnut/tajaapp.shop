import express from "express";
import { asyncHandler } from "../middleware/errorMiddleware";
import { Category } from "../models/Category";

const router = express.Router();

// @desc    Get all main categories with subcategories
// @route   GET /api/categories
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.getMainCategories();

    res.json({
      success: true,
      data: categories,
      message: "Categories retrieved successfully",
    });
  })
);

// @desc    Get subcategories for a specific category
// @route   GET /api/categories/:categoryId/subcategories
// @access  Public
router.get(
  "/:categoryId/subcategories",
  asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const subcategories = await Category.getSubcategories(categoryId);

    res.json({
      success: true,
      data: subcategories,
      message: "Subcategories retrieved successfully",
    });
  })
);

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Category retrieved successfully",
    });
  })
);

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Category retrieved successfully",
    });
  })
);

// @desc    Create new category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  })
);

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  })
);

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  })
);

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Public
router.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate(
      "productCount"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: {
        categoryId: category._id,
        categoryName: category.name,
        productCount: category.productCount || 0,
        isActive: category.isActive,
        createdAt: category.createdAt,
      },
      message: "Category statistics retrieved successfully",
    });
  })
);

export default router;

