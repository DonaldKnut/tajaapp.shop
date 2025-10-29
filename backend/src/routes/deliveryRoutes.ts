import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getDeliveryEstimate,
  bookDelivery,
  trackDelivery,
  handleDeliveryWebhook,
  getOrderDeliveryStatus,
} from "../controllers/deliveryController";

const router = express.Router();

// @desc    Get delivery estimates
// @route   POST /api/delivery/estimate
// @access  Private
router.post("/estimate", protect, getDeliveryEstimate);

// @desc    Book delivery for order
// @route   POST /api/delivery/book
// @access  Private
router.post("/book", protect, bookDelivery);

// @desc    Track delivery by tracking number
// @route   GET /api/delivery/track/:trackingNumber
// @access  Private
router.get("/track/:trackingNumber", protect, trackDelivery);

// @desc    Get order delivery status
// @route   GET /api/delivery/order/:orderId
// @access  Private
router.get("/order/:orderId", protect, getOrderDeliveryStatus);

// @desc    Handle delivery webhook (Gokada)
// @route   POST /api/delivery/webhook/gokada
// @access  Public
router.post("/webhook/gokada", handleDeliveryWebhook);

// @desc    Handle delivery webhook (Kwik)
// @route   POST /api/delivery/webhook/kwik
// @access  Public
router.post("/webhook/kwik", handleDeliveryWebhook);

export default router;



