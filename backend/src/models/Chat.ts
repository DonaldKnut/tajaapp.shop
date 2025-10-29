import mongoose, { Schema } from "mongoose";
import { IChat, IMessage, IChatModel } from "../types";

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"],
  },
  type: {
    type: String,
    enum: ["text", "image", "product", "order"],
    default: "text",
  },
  attachments: [String],
  metadata: {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  readBy: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "archived", "blocked"],
      default: "active",
    },
    lastMessage: String,
    lastMessageAt: Date,
    unreadCount: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ shop: 1 });
chatSchema.index({ product: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ participants: 1, status: 1 });

// Virtual for other participant (from current user's perspective)
chatSchema.virtual("otherParticipant").get(function () {
  // This would be set by the controller based on the current user
  return null;
});

// Pre-save middleware
chatSchema.pre("save", function (next) {
  // Ensure exactly 2 participants (buyer and seller)
  if (this.participants.length !== 2) {
    return next(new Error("Chat must have exactly 2 participants"));
  }

  // Update last message info when messages are added
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessage = lastMessage.content;
    this.lastMessageAt = lastMessage.timestamp;
  }

  next();
});

// Static methods
chatSchema.statics.findByParticipants = function (
  userId1: string,
  userId2: string,
  productId?: string
) {
  const query: any = {
    participants: { $all: [userId1, userId2] },
    status: "active",
  };

  if (productId) {
    query.product = productId;
  }

  return this.findOne(query)
    .populate("participants", "fullName avatar email")
    .populate("product", "title images price")
    .populate("shop", "shopName shopSlug logo");
};

chatSchema.statics.findUserChats = function (userId: string, limit = 20) {
  return this.find({
    participants: userId,
    status: "active",
  })
    .populate("participants", "fullName avatar email")
    .populate("product", "title images price")
    .populate("shop", "shopName shopSlug logo")
    .sort({ lastMessageAt: -1 })
    .limit(limit);
};

// Instance methods
chatSchema.methods.addMessage = function (
  senderId: string,
  content: string,
  type: string = "text",
  attachments?: string[],
  metadata?: any
) {
  const newMessage: IMessage = {
    _id: new mongoose.Types.ObjectId().toString(),
    sender: senderId,
    content,
    type: type as any,
    attachments,
    metadata,
    readBy: [
      {
        user: senderId,
        readAt: new Date(),
      },
    ],
    timestamp: new Date(),
  };

  this.messages.push(newMessage);

  // Update unread count for other participant
  const otherParticipant = this.participants.find(
    (p) => p.toString() !== senderId
  );
  if (otherParticipant) {
    const currentCount = this.unreadCount.get(otherParticipant.toString()) || 0;
    this.unreadCount.set(otherParticipant.toString(), currentCount + 1);
  }

  return this.save();
};

chatSchema.methods.markAsRead = function (userId: string) {
  // Mark unread count as 0 for this user
  this.unreadCount.set(userId, 0);

  // Mark messages as read by this user
  this.messages.forEach((message) => {
    const hasRead = message.readBy.some(
      (read) => read.user.toString() === userId
    );
    if (!hasRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date(),
      });
    }
  });

  return this.save();
};

chatSchema.methods.getUnreadCount = function (userId: string): number {
  return this.unreadCount.get(userId) || 0;
};

chatSchema.methods.isParticipant = function (userId: string): boolean {
  return this.participants.some((p) => p.toString() === userId);
};

chatSchema.methods.getOtherParticipant = function (userId: string) {
  return this.participants.find((p) => p.toString() !== userId);
};

chatSchema.methods.blockChat = function (userId: string) {
  this.status = "blocked";
  return this.save();
};

chatSchema.methods.archiveChat = function (userId: string) {
  this.status = "archived";
  return this.save();
};

export const Chat = mongoose.model<IChat, IChatModel>("Chat", chatSchema);
