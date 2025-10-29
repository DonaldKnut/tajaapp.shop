import { Request, Response } from "express";
import { Wishlist, Product } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  let wishlist = await Wishlist.findByUser(req.user._id);

  if (!wishlist) {
    // Create empty wishlist if doesn't exist
    wishlist = await Wishlist.create({
      user: req.user._id,
      items: [],
    });
  }

  res.json({
    success: true,
    data: wishlist,
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      throw new ApiErrorClass("Product not found or inactive", 404);
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [],
      });
    }

    try {
      await wishlist.addItem(productId);

      // Return updated wishlist
      wishlist = await Wishlist.findByUser(req.user._id);

      res.json({
        success: true,
        data: wishlist,
        message: "Product added to wishlist",
      });
    } catch (error: any) {
      if (error.message === "Product already in wishlist") {
        throw new ApiErrorClass("Product already in wishlist", 400);
      }
      throw error;
    }
  }
);

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new ApiErrorClass("Wishlist not found", 404);
    }

    await wishlist.removeItem(productId);

    // Return updated wishlist
    const updatedWishlist = await Wishlist.findByUser(req.user._id);

    res.json({
      success: true,
      data: updatedWishlist,
      message: "Product removed from wishlist",
    });
  }
);

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new ApiErrorClass("Wishlist not found", 404);
    }

    await wishlist.clearWishlist();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  }
);

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlistItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist ? wishlist.hasItem(productId) : false;

    res.json({
      success: true,
      data: {
        isInWishlist,
        productId,
      },
    });
  }
);

// @desc    Get popular wishlisted products
// @route   GET /api/wishlist/popular
// @access  Public
export const getPopularWishlistProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;

    const popularProducts = await Wishlist.getPopularProducts(limit);

    res.json({
      success: true,
      data: popularProducts,
    });
  }
);

// @desc    Move wishlist items to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
export const moveWishlistToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productIds } = req.body; // Array of product IDs to move

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new ApiErrorClass("Product IDs array is required", 400);
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new ApiErrorClass("Wishlist not found", 404);
    }

    // Verify all products exist in wishlist
    const validProducts = [];
    for (const productId of productIds) {
      if (wishlist.hasItem(productId)) {
        // Check if product is still available
        const product = await Product.findOne({
          _id: productId,
          status: "active",
          stock: { $gt: 0 },
        });

        if (product) {
          validProducts.push(productId);
          // Remove from wishlist
          await wishlist.removeItem(productId);
        }
      }
    }

    // TODO: Add to cart logic would go here
    // For now, we'll just remove from wishlist

    // Return updated wishlist
    const updatedWishlist = await Wishlist.findByUser(req.user._id);

    res.json({
      success: true,
      data: {
        wishlist: updatedWishlist,
        movedItems: validProducts.length,
        unavailableItems: productIds.length - validProducts.length,
      },
      message: `${validProducts.length} items moved to cart`,
    });
  }
);

// @desc    Get wishlist statistics
// @route   GET /api/wishlist/stats
// @access  Private
export const getWishlistStats = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "items.product",
      "price category"
    );

    if (!wishlist) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          totalValue: 0,
          categories: {},
          averagePrice: 0,
        },
      });
    }

    let totalValue = 0;
    const categories: { [key: string]: number } = {};

    wishlist.items.forEach((item) => {
      if (
        item.product &&
        typeof item.product === "object" &&
        "price" in item.product
      ) {
        totalValue += item.product.price;

        const category = (item.product as any).category || "Other";
        categories[category] = (categories[category] || 0) + 1;
      }
    });

    const averagePrice =
      wishlist.items.length > 0 ? totalValue / wishlist.items.length : 0;

    res.json({
      success: true,
      data: {
        totalItems: wishlist.items.length,
        totalValue,
        categories,
        averagePrice: Math.round(averagePrice),
      },
    });
  }
);



