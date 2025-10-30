import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createProductReview,
  createShopReview,
  getProductReviews,
  getShopReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  getMyReviews,
  getPendingReviews,
} from "../controllers/reviewController";

const router = express.Router();

// Product reviews
router.post("/product/:productId", protect, createProductReview);
router.get("/product/:productId", getProductReviews);

// Shop reviews
router.post("/shop/:shopId", protect, createShopReview);
router.get("/shop/:shopId", getShopReviews);

// General review operations
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.post("/:reviewId/helpful", protect, markReviewHelpful);
router.post("/:reviewId/report", protect, reportReview);

// User's reviews
router.get("/my-reviews", protect, getMyReviews);
router.get("/pending", protect, getPendingReviews);

export default router;




