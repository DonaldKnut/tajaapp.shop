import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { User } from "../models/User";

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const verified = req.query.verified as string;

    const query: any = {};

    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === "true";

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select("-password -verificationData.nin")
      .populate("shops");

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    // Update allowed fields
    const allowedUpdates = ["fullName", "email", "phone", "role", "isVerified"];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser.getPublicProfile(),
      message: "User updated successfully",
    });
  })
);

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    await user.remove();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

// @desc    Submit verification documents
// @route   POST /api/users/verify
// @access  Private
router.post(
  "/verify",
  protect,
  asyncHandler(async (req, res) => {
    const { nin, selfieUrl } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    // Update verification data
    user.verificationData = {
      nin,
      ninVerified: false,
      selfieUrl,
      selfieVerified: false,
      verificationStatus: "pending",
    };

    await user.save();

    res.json({
      success: true,
      message: "Verification documents submitted successfully",
    });
  })
);

// @desc    Verify user (Admin only)
// @route   POST /api/users/:id/approve-verification
// @access  Private/Admin
router.post(
  "/:id/approve-verification",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    user.isVerified = true;
    user.verificationData.verificationStatus = "approved";
    user.verificationData.ninVerified = true;
    user.verificationData.selfieVerified = true;
    user.verificationData.verifiedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: "User verification approved",
    });
  })
);

// @desc    Reject user verification (Admin only)
// @route   POST /api/users/:id/reject-verification
// @access  Private/Admin
router.post(
  "/:id/reject-verification",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    user.verificationData.verificationStatus = "rejected";
    user.verificationData.rejectionReason = reason;

    await user.save();

    res.json({
      success: true,
      message: "User verification rejected",
    });
  })
);

export default router;



