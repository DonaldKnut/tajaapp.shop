import express, { Request, Response } from "express";
import {
  protect,
  generateToken,
  generateRefreshToken,
} from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import {
  generateOTP,
  generateEmailToken,
  getTokenExpiration,
  sendSMSOTP,
  sendVerificationEmail,
} from "../utils/verification";

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, phone, role } = req.body;

    // Normalize phone number (remove spaces, dashes, ensure consistent format)
    const normalizedPhone = phone.replace(/[\s\-+]/g, "");

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: normalizedPhone },
        { phone: phone }, // Also check original format
      ],
    });

    if (userExists) {
      // Check if account is banned
      if (userExists.accountStatus === "banned") {
        throw new ApiErrorClass(
          "This account has been banned. Please contact support for assistance.",
          403
        );
      }

      // Check if account is suspended
      if (userExists.accountStatus === "suspended") {
        throw new ApiErrorClass(
          "This account is currently suspended. Please contact support.",
          403
        );
      }

      throw new ApiErrorClass(
        "User already exists with this email or phone",
        400
      );
    }

    // Check for potential duplicate accounts
    // Look for accounts with same phone number (different formats)
    const existingPhones = await User.find({
      $or: [
        { phone: new RegExp(normalizedPhone.slice(-10), "i") }, // Last 10 digits
        { phone: phone },
        { phone: normalizedPhone },
      ],
    });

    // Check if email domain looks suspicious (throwaway emails)
    const suspiciousDomains = [
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
    ];
    const emailDomain = email.split("@")[1]?.toLowerCase();
    const isSuspiciousEmail = suspiciousDomains.some((domain) =>
      emailDomain?.includes(domain)
    );

    // Create user with initial fraud flags
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || "buyer",
      accountStatus: "active",
      phoneVerified: false,
      emailVerified: false,
      fraudFlags: {
        suspiciousActivity: isSuspiciousEmail || existingPhones.length > 0,
        multipleAccounts: existingPhones.length > 0,
        highCancellationRate: false,
        ...(existingPhones.length > 0 && {
          reason: `Multiple accounts detected with similar phone number`,
        }),
      },
      ...(existingPhones.length > 0 && { accountStatus: "under_review" }),
    });

    // If duplicate phone numbers found, flag all related accounts
    if (existingPhones.length > 0) {
      const updatePromises = existingPhones.map((existingUser: any) =>
        User.findByIdAndUpdate(existingUser._id, {
          $set: {
            "fraudFlags.multipleAccounts": true,
            "fraudFlags.reason": "Multiple accounts with same phone detected",
            accountStatus:
              existingUser.accountStatus === "banned"
                ? "banned"
                : "under_review",
          },
        })
      );
      await Promise.all(updatePromises);

      // Log for admin review
      console.warn(
        `[FRAUD DETECTION] Multiple accounts detected: ${normalizedPhone}`
      );
    }

    if (user) {
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          token,
          refreshToken,
        },
        message: "User registered successfully",
      });
    } else {
      throw new ApiErrorClass("Invalid user data", 400);
    }
  })
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiErrorClass("Invalid credentials", 401);
    }

    // Check account status
    if (user.accountStatus === "banned") {
      throw new ApiErrorClass(
        "Your account has been banned. Contact support for assistance.",
        403
      );
    }

    if (user.accountStatus === "suspended") {
      throw new ApiErrorClass(
        "Your account is suspended. Contact support for assistance.",
        403
      );
    }

    if (user.accountStatus === "under_review") {
      throw new ApiErrorClass(
        "Your account is under review. Please contact support.",
        403
      );
    }

    // Check if account is locked due to failed login attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      throw new ApiErrorClass(
        `Account locked due to too many failed attempts. Try again in ${lockMinutes} minutes.`,
        403
      );
    }

    if (await user.comparePassword(password)) {
      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }

      // Update last login info
      user.lastLoginAt = new Date();
      user.lastLoginIp = req.ip;
      await user.save();

      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          accountStatus: user.accountStatus,
          avatar: user.avatar,
          token,
          refreshToken,
        },
        message: "Login successful",
      });
    } else {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5 && !user.lockUntil) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        throw new ApiErrorClass(
          "Too many failed login attempts. Account locked for 30 minutes.",
          403
        );
      }

      await user.save();
      throw new ApiErrorClass(
        `Invalid email or password. ${
          5 - user.loginAttempts
        } attempts remaining.`,
        401
      );
    }
  })
);

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get(
  "/profile",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id).populate("shops");

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    res.json({
      success: true,
      data: user.getPublicProfile(),
      message: "Profile retrieved successfully",
    });
  })
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.preferences) {
        user.preferences = { ...user.preferences, ...req.body.preferences };
      }

      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: updatedUser.getPublicProfile(),
        message: "Profile updated successfully",
      });
    } else {
      throw new ApiErrorClass("User not found", 404);
    }
  })
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById((req as any).user._id).select("+password");

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } else {
      throw new ApiErrorClass("Current password is incorrect", 400);
    }
  })
);

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiErrorClass("No user found with this email", 404);
    }

    // TODO: Implement password reset email logic
    // Generate reset token, save to user, send email

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  })
);

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post(
  "/reset-password",
  asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // TODO: Implement password reset logic
    // Verify token, update password

    res.json({
      success: true,
      message: "Password reset successful",
    });
  })
);

// @desc    Send phone verification OTP
// @route   POST /api/auth/send-phone-otp
// @access  Private
router.post(
  "/send-phone-otp",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    if (user.phoneVerified) {
      throw new ApiErrorClass("Phone already verified", 400);
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiration = getTokenExpiration("otp");

    // Save OTP to user
    user.phoneVerificationCode = otp;
    user.phoneVerificationExpires = expiration;
    await user.save();

    // Send OTP via SMS
    await sendSMSOTP(user.phone, otp);

    res.json({
      success: true,
      message: "OTP sent to your phone number",
      expiresIn: "10 minutes",
    });
  })
);

// @desc    Verify phone OTP
// @route   POST /api/auth/verify-phone
// @access  Private
router.post(
  "/verify-phone",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const user = await User.findById((req as any).user._id).select(
      "+phoneVerificationCode"
    );

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    if (!code) {
      throw new ApiErrorClass("Verification code is required", 400);
    }

    if (user.phoneVerified) {
      throw new ApiErrorClass("Phone already verified", 400);
    }

    // Check if OTP exists and is valid
    if (!user.phoneVerificationCode) {
      throw new ApiErrorClass(
        "No verification code found. Please request a new one.",
        400
      );
    }

    if (
      user.phoneVerificationExpires &&
      user.phoneVerificationExpires < new Date()
    ) {
      throw new ApiErrorClass(
        "Verification code expired. Please request a new one.",
        400
      );
    }

    if (user.phoneVerificationCode !== code) {
      throw new ApiErrorClass("Invalid verification code", 400);
    }

    // Verify phone
    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Phone number verified successfully",
    });
  })
);

// @desc    Send email verification
// @route   POST /api/auth/send-email-verification
// @access  Private
router.post(
  "/send-email-verification",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id);

    if (!user) {
      throw new ApiErrorClass("User not found", 404);
    }

    if (user.emailVerified) {
      throw new ApiErrorClass("Email already verified", 400);
    }

    // Generate verification token
    const token = generateEmailToken();
    const expiration = getTokenExpiration("email");

    // Save token to user
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expiration;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, token, user.fullName);

    res.json({
      success: true,
      message: "Verification email sent",
      expiresIn: "24 hours",
    });
  })
);

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get(
  "/verify-email/:token",
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token }).select(
      "+emailVerificationToken"
    );

    if (!user) {
      throw new ApiErrorClass("Invalid verification token", 400);
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: "Email already verified",
      });
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw new ApiErrorClass(
        "Verification token expired. Please request a new one.",
        400
      );
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  })
);

export default router;
