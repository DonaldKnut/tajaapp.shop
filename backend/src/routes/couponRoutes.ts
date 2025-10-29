import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAvailableCoupons,
  generateCouponCode,
} from "../controllers/couponController";

const router = express.Router();

// Public/user routes
router.post("/validate", protect, validateCoupon);
router.get("/available", protect, getAvailableCoupons);

// Seller/Admin routes
router.post("/", protect, createCoupon);
router.get("/", protect, getCoupons);
router.get("/generate-code", protect, generateCouponCode);
router.get("/:couponId", protect, getCoupon);
router.put("/:couponId", protect, updateCoupon);
router.delete("/:couponId", protect, deleteCoupon);

export default router;



