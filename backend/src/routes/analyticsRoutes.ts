import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  getSellerDashboardAnalytics,
  getSellerSalesAnalytics,
  getProductAnalytics,
  getAdminPlatformAnalytics,
} from "../controllers/analyticsController";

const router = express.Router();

// Seller analytics routes
router.get("/seller/dashboard", protect, getSellerDashboardAnalytics);
router.get("/seller/sales", protect, getSellerSalesAnalytics);
router.get("/seller/products", protect, getProductAnalytics);

// Admin analytics routes
router.get(
  "/admin/platform",
  protect,
  authorize("admin"),
  getAdminPlatformAnalytics
);

export default router;




