import express from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  validateNIN,
  submitVerification,
  getVerificationStatus,
  getPendingVerifications,
  reviewVerification,
  getVerificationDocument,
  resubmitVerification,
  upload
} from "../controllers/verificationController";

const router = express.Router();

// @desc    Validate NIN
// @route   POST /api/verification/validate-nin
// @access  Private
router.post("/validate-nin", protect, validateNIN);

// @desc    Submit verification documents
// @route   POST /api/verification/submit
// @access  Private
router.post(
  "/submit", 
  protect,
  upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'ninImage', maxCount: 1 },
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
  ]),
  submitVerification
);

// @desc    Get verification status
// @route   GET /api/verification/status
// @access  Private
router.get("/status", protect, getVerificationStatus);

// @desc    Re-submit verification after rejection
// @route   POST /api/verification/resubmit
// @access  Private
router.post("/resubmit", protect, resubmitVerification);

// @desc    Get verification document
// @route   GET /api/verification/document/:filename
// @access  Private/Admin
router.get("/document/:filename", protect, getVerificationDocument);

// Admin routes
// @desc    Get all pending verifications
// @route   GET /api/verification/pending
// @access  Private/Admin
router.get("/pending", protect, authorize("admin"), getPendingVerifications);

// @desc    Review verification
// @route   POST /api/verification/:userId/review
// @access  Private/Admin
router.post("/:userId/review", protect, authorize("admin"), reviewVerification);

export default router;




