import mongoose, { Schema } from "mongoose";
import { INotificationCenter, INotificationCenterModel } from "../types";

const notificationCenterSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "chat",
        "review",
        "shop",
        "system",
        "promotion",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      default: "general",
    },
    actionUrl: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationCenterSchema.index({ user: 1, createdAt: -1 });
notificationCenterSchema.index({ user: 1, read: 1 });
notificationCenterSchema.index({ user: 1, type: 1 });
notificationCenterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationCenterSchema.index({ priority: 1, createdAt: -1 });

// Virtual for age
notificationCenterSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Static Methods
notificationCenterSchema.statics.createForUser = async function (
  userId: string,
  type: string,
  title: string,
  message: string,
  options: Partial<INotificationCenter> = {}
): Promise<INotificationCenter> {
  const notification = await this.create({
    user: userId,
    type,
    title,
    message,
    ...options,
  });

  // Emit real-time notification via Socket.io
  const io = require("../config/socket").getIO?.();
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", {
      notification,
      unreadCount: await (this as any).getUnreadCount(userId),
    });
  }

  return notification;
};

notificationCenterSchema.statics.createBulkNotifications = async function (
  userIds: string[],
  type: string,
  title: string,
  message: string,
  options: Partial<INotificationCenter> = {}
): Promise<number> {
  const notifications = userIds.map((userId) => ({
    user: userId,
    type,
    title,
    message,
    ...options,
  }));

  const result = await this.insertMany(notifications);

  // Emit real-time notifications
  const io = require("../config/socket").getIO?.();
  if (io) {
    for (const userId of userIds) {
      const unreadCount = await (this as any).getUnreadCount(userId);
      io.to(`user_${userId}`).emit("new_notification", {
        notification: result.find((n) => n.user.toString() === userId),
        unreadCount,
      });
    }
  }

  return result.length;
};

notificationCenterSchema.statics.markAsRead = async function (
  notificationIds: string[],
  userId: string
): Promise<number> {
  const result = await this.updateMany(
    {
      _id: { $in: notificationIds },
      user: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );

  // Emit updated unread count
  const io = require("../config/socket").getIO?.();
  if (io) {
    const unreadCount = await (this as any).getUnreadCount(userId);
    io.to(`user_${userId}`).emit("notifications_read", {
      readCount: result.modifiedCount,
      unreadCount,
    });
  }

  return result.modifiedCount;
};

notificationCenterSchema.statics.markAllAsRead = async function (
  userId: string
): Promise<number> {
  const result = await this.updateMany(
    {
      user: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );

  // Emit updated unread count
  const io = require("../config/socket").getIO();
  if (io) {
    io.to(`user_${userId}`).emit("notifications_read", {
      readCount: result.modifiedCount,
      unreadCount: 0,
    });
  }

  return result.modifiedCount;
};

notificationCenterSchema.statics.getUnreadCount = async function (
  userId: string
): Promise<number> {
  return await this.countDocuments({
    user: userId,
    read: false,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });
};

notificationCenterSchema.statics.getUserNotifications = async function (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    type?: string;
    unreadOnly?: boolean;
  } = {}
): Promise<{
  notifications: INotificationCenter[];
  total: number;
  unreadCount: number;
}> {
  const { page = 1, limit = 20, type, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {
    user: userId,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };

  if (type) {
    filter.type = type;
  }

  if (unreadOnly) {
    filter.read = false;
  }

  // Get notifications
  const notifications = await this.find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await this.countDocuments(filter);

  // Get unread count
  const unreadCount = await (this as any).getUnreadCount(userId);

  return {
    notifications,
    total,
    unreadCount,
  };
};

notificationCenterSchema.statics.cleanupExpired =
  async function (): Promise<number> {
    const result = await this.deleteMany({
      expiresAt: { $lte: new Date() },
    });
    return result.deletedCount;
  };

// Pre-save middleware
notificationCenterSchema.pre("save", function (next) {
  if (this.isModified("read") && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const NotificationCenter = mongoose.model<any, any>(
  "NotificationCenter",
  notificationCenterSchema
);

export default NotificationCenter;




