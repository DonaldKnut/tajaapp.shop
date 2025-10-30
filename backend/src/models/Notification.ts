import mongoose, { Schema } from "mongoose";
import { INotification, INotificationModel } from "../types";

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "message", "review", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    channels: [
      {
        type: String,
        enum: ["email", "sms", "push"],
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for age in minutes
notificationSchema.virtual("ageInMinutes").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.floor(diffTime / (1000 * 60));
});

// Static methods
notificationSchema.statics.getUserNotifications = function (
  userId: string,
  page = 1,
  limit = 20,
  unreadOnly = false
) {
  const query: any = { recipient: userId };
  if (unreadOnly) {
    query.read = false;
  }

  const skip = (page - 1) * limit;

  return this.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

notificationSchema.statics.getUnreadCount = function (userId: string) {
  return this.countDocuments({ recipient: userId, read: false });
};

notificationSchema.statics.markAllAsRead = function (userId: string) {
  return this.updateMany(
    { recipient: userId, read: false },
    {
      read: true,
      readAt: new Date(),
    }
  );
};

notificationSchema.statics.createNotification = async function (data: {
  recipient: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  channels?: string[];
}) {
  const notification = new this({
    recipient: data.recipient,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    channels: data.channels || ["push"],
  });

  await notification.save();

  // TODO: Implement actual notification sending (email, SMS, push)
  // This would integrate with services like:
  // - Email: Nodemailer, SendGrid, etc.
  // - SMS: Twilio, Termii, etc.
  // - Push: FCM, OneSignal, etc.

  return notification;
};

// Notification templates
notificationSchema.statics.createOrderNotification = function (
  orderId: string,
  buyerId: string,
  sellerId: string,
  type: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled"
) {
  const templates = {
    placed: {
      buyer: {
        title: "Order Placed",
        message:
          "Your order has been placed successfully and is being processed.",
      },
      seller: {
        title: "New Order",
        message:
          "You have received a new order. Please confirm and process it.",
      },
    },
    confirmed: {
      buyer: {
        title: "Order Confirmed",
        message:
          "Your order has been confirmed and is being prepared for shipping.",
      },
      seller: {
        title: "Order Confirmed",
        message:
          "You have confirmed the order. Please prepare it for shipping.",
      },
    },
    shipped: {
      buyer: {
        title: "Order Shipped",
        message: "Your order has been shipped and is on its way to you.",
      },
      seller: {
        title: "Order Shipped",
        message: "You have successfully shipped the order.",
      },
    },
    delivered: {
      buyer: {
        title: "Order Delivered",
        message:
          "Your order has been delivered. Please confirm receipt and leave a review.",
      },
      seller: {
        title: "Order Delivered",
        message: "Your order has been successfully delivered to the buyer.",
      },
    },
    cancelled: {
      buyer: {
        title: "Order Cancelled",
        message: "Your order has been cancelled. Any payment will be refunded.",
      },
      seller: {
        title: "Order Cancelled",
        message: "The order has been cancelled.",
      },
    },
  };

  const notifications = [];

  // Notification for buyer
  if (templates[type].buyer) {
    notifications.push(
      (this as unknown as INotificationModel).createNotification({
        recipient: buyerId,
        type: "order",
        title: templates[type].buyer.title,
        message: templates[type].buyer.message,
        data: { orderId, type },
        channels: ["push", "email"],
      })
    );
  }

  // Notification for seller
  if (templates[type].seller) {
    notifications.push(
      (this as unknown as INotificationModel).createNotification({
        recipient: sellerId,
        type: "order",
        title: templates[type].seller.title,
        message: templates[type].seller.message,
        data: { orderId, type },
        channels: ["push", "email"],
      })
    );
  }

  return Promise.all(notifications);
};

// Convenience helpers referenced by controllers
notificationSchema.statics.createForAdmins = async function (
  event: string,
  title: string,
  message?: string,
  data?: any
) {
  // For now, just create a system notification to a hypothetical admin channel or skip
  // In a real implementation, we'd look up admin users. This is a no-op placeholder to satisfy build.
  return [];
};

notificationSchema.statics.createForUser = async function (
  userId: string,
  event: string,
  title: string,
  message?: string,
  data?: any
) {
  return (this as unknown as INotificationModel).createNotification({
    recipient: userId,
    type: "system",
    title,
    message: message || "",
    data: { event, ...(data || {}) },
    channels: ["push"],
  });
};

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.getTimeAgo = function (): string {
  const minutes = this.ageInMinutes;

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema
);
export default Notification;
