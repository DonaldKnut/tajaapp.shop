import express from "express";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { Order } from "../models/Order";

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const orderData = {
      ...req.body,
      buyer: req.user._id,
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  })
);

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = (req.query.status as string) || "all";
    const userType = (req.query.userType as "buyer" | "seller") || "buyer";

    const orders = await Order.getOrdersByStatus(
      req.user._id,
      status,
      userType
    );

    res.json({
      success: true,
      data: orders,
    });
  })
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "fullName email phone avatar")
      .populate("seller", "fullName email phone avatar")
      .populate("shop", "shopName shopSlug logo")
      .populate("items.product", "title images");

    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Check if user is authorized to view this order
    const isAuthorized =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.seller._id.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isAuthorized) {
      throw new ApiErrorClass("Not authorized to view this order", 403);
    }

    res.json({
      success: true,
      data: order,
    });
  })
);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
router.put(
  "/:id/status",
  protect,
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Check authorization
    const canUpdate =
      order.seller._id.toString() === req.user._id.toString() ||
      (order.buyer._id.toString() === req.user._id.toString() &&
        ["cancelled"].includes(status)) ||
      req.user.role === "admin";

    if (!canUpdate) {
      throw new ApiErrorClass("Not authorized to update this order", 403);
    }

    // Validate status transition
    if (!order.canUpdateStatus(status)) {
      throw new ApiErrorClass(
        `Cannot change status from ${order.status} to ${status}`,
        400
      );
    }

    await order.updateStatus(status, note);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  })
);

export default router;



