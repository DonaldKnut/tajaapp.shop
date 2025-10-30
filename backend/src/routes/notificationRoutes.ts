import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getVapidPublicKey,
} from "../controllers/notificationController";

const router = express.Router();

// Get VAPID public key (public route)
router.get("/vapid-key", getVapidPublicKey);

// Protected routes
router.use(protect);

// Get notifications
router.get("/", getNotifications);

// Mark notifications as read
router.put("/read", markNotificationsAsRead);
router.put("/read-all", markAllNotificationsAsRead);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Delete notification
router.delete("/:notificationId", deleteNotification);

// Push notification subscription
router.post("/subscribe", subscribeToPushNotifications);
router.delete("/subscribe", unsubscribeFromPushNotifications);

// Send test notification
router.post("/test", sendTestNotification);

// Notification settings
router.get("/settings", getNotificationSettings);
router.put("/settings", updateNotificationSettings);

export default router;




