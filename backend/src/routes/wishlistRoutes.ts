import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
  getPopularWishlistProducts,
  moveWishlistToCart,
  getWishlistStats,
} from "../controllers/wishlistController";

const router = express.Router();

// Get user's wishlist
router.get("/", protect, getWishlist);

// Add product to wishlist
router.post("/:productId", protect, addToWishlist);

// Remove product from wishlist
router.delete("/:productId", protect, removeFromWishlist);

// Clear entire wishlist
router.delete("/", protect, clearWishlist);

// Check if product is in wishlist
router.get("/check/:productId", protect, checkWishlistItem);

// Get popular wishlisted products (public)
router.get("/popular", getPopularWishlistProducts);

// Move wishlist items to cart
router.post("/move-to-cart", protect, moveWishlistToCart);

// Get wishlist statistics
router.get("/stats", protect, getWishlistStats);

export default router;



