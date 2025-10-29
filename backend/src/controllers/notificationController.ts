import { Request, Response } from "express";
import { NotificationCenter, PushSubscription } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import webpush from "web-push";

// Configure web-push
webpush.setVapidDetails(
  "mailto:support@taja.shop",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const unreadOnly = req.query.unreadOnly === "true";

    const result = await NotificationCenter.getUserNotifications(req.user._id, {
      page,
      limit,
      type,
      unreadOnly,
    });

    res.json({
      success: true,
      data: {
        notifications: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
        unreadCount: result.unreadCount,
      },
    });
  }
);

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      throw new ApiErrorClass("Notification IDs array is required", 400);
    }

    const readCount = await NotificationCenter.markAsRead(
      notificationIds,
      req.user._id
    );

    res.json({
      success: true,
      data: {
        readCount,
      },
      message: `${readCount} notifications marked as read`,
    });
  }
);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const readCount = await NotificationCenter.markAllAsRead(req.user._id);

    res.json({
      success: true,
      data: {
        readCount,
      },
      message: `${readCount} notifications marked as read`,
    });
  }
);

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const unreadCount = await NotificationCenter.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  }
);

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    const notification = await NotificationCenter.findOne({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      throw new ApiErrorClass("Notification not found", 404);
    }

    await NotificationCenter.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  }
);

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
export const subscribeToPushNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { endpoint, keys, userAgent, deviceType } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      throw new ApiErrorClass("Valid subscription data is required", 400);
    }

    try {
      // Check if subscription already exists
      let subscription = await PushSubscription.findOne({ endpoint });

      if (subscription) {
        // Update existing subscription
        subscription.user = req.user._id;
        subscription.keys = keys;
        subscription.userAgent = userAgent || "";
        subscription.deviceType = deviceType || "web";
        subscription.isActive = true;
        subscription.lastUsed = new Date();
        await subscription.save();
      } else {
        // Create new subscription
        subscription = await PushSubscription.create({
          user: req.user._id,
          endpoint,
          keys,
          userAgent: userAgent || "",
          deviceType: deviceType || "web",
        });
      }

      // Deactivate old subscriptions (keep only 3 most recent)
      await PushSubscription.deactivateOldSubscriptions(req.user._id, 3);

      res.json({
        success: true,
        data: {
          subscriptionId: subscription._id,
        },
        message: "Successfully subscribed to push notifications",
      });
    } catch (error) {
      console.error("Push subscription error:", error);
      throw new ApiErrorClass("Failed to subscribe to push notifications", 500);
    }
  }
);

// @desc    Unsubscribe from push notifications
// @route   DELETE /api/notifications/subscribe
// @access  Private
export const unsubscribeFromPushNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { endpoint } = req.body;

    if (!endpoint) {
      throw new ApiErrorClass("Endpoint is required", 400);
    }

    const result = await PushSubscription.updateOne(
      { endpoint, user: req.user._id },
      { $set: { isActive: false } }
    );

    res.json({
      success: true,
      data: {
        unsubscribed: result.modifiedCount > 0,
      },
      message:
        result.modifiedCount > 0
          ? "Successfully unsubscribed from push notifications"
          : "Subscription not found",
    });
  }
);

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
export const sendTestNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title = "Test Notification",
      message = "This is a test notification from Taja.Shop!",
    } = req.body;

    // Create in-app notification
    const notification = await NotificationCenter.createForUser(
      req.user._id,
      "system",
      title,
      message,
      {
        priority: "normal",
        category: "test",
      }
    );

    // Send push notification
    await sendPushNotification(req.user._id, {
      title,
      body: message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: {
        notificationId: notification._id,
        url: "/notifications",
      },
    });

    res.json({
      success: true,
      data: {
        notification,
      },
      message: "Test notification sent successfully",
    });
  }
);

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
export const getNotificationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    // This would typically come from user preferences
    // For now, return default settings
    const settings = {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      categories: {
        orders: true,
        payments: true,
        chat: true,
        reviews: true,
        promotions: false,
        system: true,
      },
      schedule: {
        enabled: false,
        startTime: "09:00",
        endTime: "22:00",
        timezone: "Africa/Lagos",
      },
    };

    res.json({
      success: true,
      data: settings,
    });
  }
);

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
export const updateNotificationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { pushEnabled, emailEnabled, smsEnabled, categories, schedule } =
      req.body;

    // TODO: Update user notification preferences in database
    // For now, just return the updated settings

    const updatedSettings = {
      pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
      emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
      categories: categories || {
        orders: true,
        payments: true,
        chat: true,
        reviews: true,
        promotions: false,
        system: true,
      },
      schedule: schedule || {
        enabled: false,
        startTime: "09:00",
        endTime: "22:00",
        timezone: "Africa/Lagos",
      },
    };

    res.json({
      success: true,
      data: updatedSettings,
      message: "Notification settings updated successfully",
    });
  }
);

// Helper function to send push notifications
export const sendPushNotification = async (
  userId: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    data?: any;
    actions?: Array<{ action: string; title: string; icon?: string }>;
  }
) => {
  try {
    const subscriptions = await PushSubscription.findActiveByUser(userId);

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      image: payload.image,
      data: payload.data || {},
      actions: payload.actions,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    });

    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          notificationPayload,
          {
            TTL: 24 * 60 * 60, // 24 hours
            urgency: "normal",
          }
        );

        // Update last used timestamp
        subscription.lastUsed = new Date();
        await subscription.save();
      } catch (error: any) {
        console.error(
          `Push notification failed for subscription ${subscription._id}:`,
          error
        );

        // If subscription is invalid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          subscription.isActive = false;
          await subscription.save();
        }
      }
    });

    await Promise.allSettled(pushPromises);
    console.log(
      `Push notifications sent to ${subscriptions.length} devices for user ${userId}`
    );
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};

// @desc    Get VAPID public key
// @route   GET /api/notifications/vapid-key
// @access  Public
export const getVapidPublicKey = asyncHandler(
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        publicKey: process.env.VAPID_PUBLIC_KEY || "",
      },
    });
  }
);



