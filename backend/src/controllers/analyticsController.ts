import { Request, Response } from "express";
import { Order, Product, Shop, User, Review, Chat } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import mongoose from "mongoose";

// @desc    Get seller dashboard analytics
// @route   GET /api/analytics/seller/dashboard
// @access  Private (Seller)
export const getSellerDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { period = "30d" } = req.query; // 7d, 30d, 90d, 1y

    // Get seller's shop
    const user = await User.findById(userId).populate("shop");
    if (!user?.shop) {
      throw new ApiErrorClass("Shop not found", 404);
    }

    const shopId = user.shop._id;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic metrics
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      averageRating,
      totalViews,
      conversionRate,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({
        seller: userId,
        createdAt: { $gte: startDate },
      }),

      // Total revenue (completed orders only)
      Order.aggregate([
        {
          $match: {
            seller: new mongoose.Types.ObjectId(userId),
            status: { $in: ["delivered", "completed"] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]).then((result: Array<{ total?: number }>) => result[0]?.total || 0),

      // Total products
      Product.countDocuments({ shop: shopId }),

      // Average rating
      Review.aggregate([
        {
          $match: {
            shop: shopId,
            type: "shop",
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]).then(
        (result: Array<{ avgRating?: number; totalReviews?: number }>) => ({
          rating: result[0]?.avgRating || 0,
          count: result[0]?.totalReviews || 0,
        })
      ),

      // Total product views (mock data for now)
      Product.aggregate([
        {
          $match: { shop: shopId },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ]).then(
        (result: Array<{ totalViews?: number }>) => result[0]?.totalViews || 0
      ),

      // Conversion rate (orders / views)
      Promise.resolve(0), // Will calculate after getting views
    ]);

    // Calculate actual conversion rate
    const actualConversionRate =
      totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    // Get sales trend (daily breakdown)
    const salesTrend = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          sales: 1,
          orders: 1,
        },
      },
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: "$product._id",
          title: "$product.title",
          images: "$product.images",
          price: "$product.price",
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find({
      seller: userId,
    })
      .populate("buyer", "fullName avatar")
      .populate("items.product", "title images")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue,
          totalProducts,
          averageRating: {
            rating: Math.round(averageRating.rating * 10) / 10,
            count: averageRating.count,
          },
          totalViews,
          conversionRate: Math.round(actualConversionRate * 100) / 100,
        },
        salesTrend,
        topProducts,
        recentOrders,
        orderStatusDistribution: orderStatusDistribution.reduce(
          (
            acc: Record<string, number>,
            item: { _id: string; count: number }
          ) => {
            acc[item._id] = item.count;
            return acc;
          },
          {} as Record<string, number>
        ),
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  }
);

// @desc    Get detailed sales analytics
// @route   GET /api/analytics/seller/sales
// @access  Private (Seller)
export const getSellerSalesAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { period = "30d", groupBy = "day" } = req.query; // day, week, month

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build aggregation grouping based on groupBy parameter
    let grouping: any = {};
    switch (groupBy) {
      case "day":
        grouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "week":
        grouping = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "month":
        grouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default:
        grouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    // Get detailed sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: grouping,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
          uniqueCustomers: { $addToSet: "$buyer" },
        },
      },
      {
        $addFields: {
          uniqueCustomerCount: { $size: "$uniqueCustomers" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 },
      },
    ]);

    // Get category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
          averagePrice: { $avg: "$items.price" },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Get customer demographics (repeat vs new customers)
    const customerAnalytics = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$buyer",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          orderCount: 1,
          totalSpent: 1,
          customerType: {
            $cond: {
              if: { $eq: ["$orderCount", 1] },
              then: "new",
              else: "repeat",
            },
          },
        },
      },
      {
        $group: {
          _id: "$customerType",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalSpent" },
          averageSpent: { $avg: "$totalSpent" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        categoryPerformance,
        customerAnalytics: customerAnalytics.reduce(
          (
            acc: Record<string, any>,
            item: {
              _id: string;
              count: number;
              totalRevenue: number;
              averageSpent: number;
            }
          ) => {
            acc[item._id] = {
              count: item.count,
              totalRevenue: item.totalRevenue,
              averageSpent: Math.round(item.averageSpent),
            };
            return acc;
          },
          {} as Record<string, any>
        ),
        period,
        groupBy,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  }
);

// @desc    Get product performance analytics
// @route   GET /api/analytics/seller/products
// @access  Private (Seller)
export const getProductAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { period = "30d" } = req.query;

    // Get seller's shop
    const user = await User.findById(userId).populate("shop");
    if (!user?.shop) {
      throw new ApiErrorClass("Shop not found", 404);
    }

    const shopId = user.shop._id;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get product performance metrics
    const productPerformance = await Product.aggregate([
      {
        $match: { shop: shopId },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                seller: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startDate },
                $expr: {
                  $in: ["$$productId", "$items.product"],
                },
              },
            },
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.product", "$$productId"] },
              },
            },
          ],
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          totalSold: {
            $sum: "$orderItems.items.quantity",
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$orderItems.items.quantity",
                "$orderItems.items.price",
              ],
            },
          },
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
          views: { $ifNull: ["$views", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          images: 1,
          price: 1,
          stock: 1,
          status: 1,
          category: 1,
          totalSold: 1,
          totalRevenue: 1,
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          views: 1,
          conversionRate: {
            $cond: {
              if: { $gt: ["$views", 0] },
              then: { $multiply: [{ $divide: ["$totalSold", "$views"] }, 100] },
              else: 0,
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get low stock alerts
    const lowStockProducts = await Product.find({
      shop: shopId,
      stock: { $lte: 5, $gt: 0 },
      status: "active",
    })
      .select("title images stock price")
      .sort({ stock: 1 });

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      shop: shopId,
      stock: 0,
      status: "active",
    })
      .select("title images price")
      .limit(10);

    // Get product category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $match: { shop: shopId },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        productPerformance,
        lowStockProducts,
        outOfStockProducts,
        categoryDistribution,
        summary: {
          totalProducts: productPerformance.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          averageRating:
            productPerformance.reduce(
              (sum: number, p: { averageRating?: number }) =>
                sum + (p.averageRating || 0),
              0
            ) / productPerformance.length || 0,
        },
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  }
);

// @desc    Get admin platform analytics
// @route   GET /api/analytics/admin/platform
// @access  Private (Admin)
export const getAdminPlatformAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = "30d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get platform metrics
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalRevenue,
      newUsers,
      newShops,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "completed"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]).then((result: Array<{ total?: number }>) => result[0]?.total || 0),

      User.countDocuments({
        createdAt: { $gte: startDate },
      }),

      Shop.countDocuments({
        createdAt: { $gte: startDate },
      }),

      // Active users (those with recent orders or chats)
      Promise.all([
        Order.distinct("buyer", {
          createdAt: { $gte: startDate },
        }),
        Order.distinct("seller", {
          createdAt: { $gte: startDate },
        }),
        Chat.distinct("participants", {
          updatedAt: { $gte: startDate },
        }),
      ]).then(([buyers, sellers, chatters]) => {
        const activeUserIds = new Set([...buyers, ...sellers, ...chatters]);
        return activeUserIds.size;
      }),
    ]);

    // Get growth trends
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const orderGrowth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Get top performing shops
    const topShops = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$seller",
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $lookup: {
          from: "shops",
          localField: "seller.shop",
          foreignField: "_id",
          as: "shop",
        },
      },
      { $unwind: "$shop" },
      {
        $project: {
          shopName: "$shop.shopName",
          shopSlug: "$shop.shopSlug",
          logo: "$shop.logo",
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalShops,
          totalProducts,
          totalOrders,
          totalRevenue,
          newUsers,
          newShops,
          activeUsers,
        },
        growth: {
          users: userGrowth,
          orders: orderGrowth,
        },
        topShops,
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    });
  }
);
