import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { asyncHandler, ApiErrorClass } from "./errorMiddleware";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT Token verification middleware
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Get user from the token and attach to request
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
          throw new ApiErrorClass("User not found", 401);
        }

        // Check account status (skip for admin routes that need to manage accounts)
        if (req.user.accountStatus === "banned") {
          throw new ApiErrorClass(
            "Your account has been banned. Contact support.",
            403
          );
        }

        if (req.user.accountStatus === "suspended") {
          throw new ApiErrorClass(
            "Your account is suspended. Contact support.",
            403
          );
        }

        next();
      } catch (error) {
        throw new ApiErrorClass("Not authorized, token failed", 401);
      }
    }

    if (!token) {
      throw new ApiErrorClass("Not authorized, no token", 401);
    }
  }
);

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiErrorClass("Not authorized", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiErrorClass(
        `User role ${req.user.role} is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

// Check if user is verified
export const requireVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new ApiErrorClass("Not authorized", 401);
  }

  if (!req.user.isVerified) {
    throw new ApiErrorClass("Account verification required", 403);
  }

  next();
};

// Check if user owns the shop
export const checkShopOwnership = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const Shop = (await import("../models/Shop")).default;

    const shopId = req.params.shopId || req.body.shopId;

    if (!shopId) {
      throw new ApiErrorClass("Shop ID is required", 400);
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      throw new ApiErrorClass("Shop not found", 404);
    }

    if (
      shop.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiErrorClass("Not authorized to access this shop", 403);
    }

    (req as any).shop = shop;
    next();
  }
);

// Optional authentication (for public routes that benefit from user context)
export const optionalAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = await User.findById(decoded.id).select("-password");
      } catch (error) {
        // Continue without user if token is invalid
        req.user = null;
      }
    }

    next();
  }
);

// Generate JWT Token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  } as jwt.SignOptions);
};

// Generate Refresh Token
export const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
};
