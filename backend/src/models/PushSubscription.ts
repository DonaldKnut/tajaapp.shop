import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IPushSubscription extends Document {
  user: IUser["_id"];
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  deviceType: "web" | "mobile" | "tablet";
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPushSubscriptionModel
  extends mongoose.Model<IPushSubscription> {
  findActiveByUser(userId: string): Promise<IPushSubscription[]>;
  deactivateOldSubscriptions(
    userId: string,
    keepCount?: number
  ): Promise<number>;
  cleanupInactive(daysInactive?: number): Promise<number>;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["web", "mobile", "tablet"],
      default: "web",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pushSubscriptionSchema.index({ user: 1, isActive: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
pushSubscriptionSchema.index({ lastUsed: 1 });
pushSubscriptionSchema.index({ createdAt: 1 });

// Static Methods
pushSubscriptionSchema.statics.findActiveByUser = async function (
  userId: string
): Promise<IPushSubscription[]> {
  return await this.find({
    user: userId,
    isActive: true,
  }).sort({ lastUsed: -1 });
};

pushSubscriptionSchema.statics.deactivateOldSubscriptions = async function (
  userId: string,
  keepCount = 3
): Promise<number> {
  const subscriptions = await this.find({
    user: userId,
    isActive: true,
  }).sort({ lastUsed: -1 });

  if (subscriptions.length <= keepCount) {
    return 0;
  }

  const subscriptionsToDeactivate = subscriptions.slice(keepCount);
  const idsToDeactivate = subscriptionsToDeactivate.map((sub) => sub._id);

  const result = await this.updateMany(
    { _id: { $in: idsToDeactivate } },
    { $set: { isActive: false } }
  );

  return result.modifiedCount;
};

pushSubscriptionSchema.statics.cleanupInactive = async function (
  daysInactive = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const result = await this.deleteMany({
    $or: [{ isActive: false }, { lastUsed: { $lt: cutoffDate } }],
  });

  return result.deletedCount;
};

const PushSubscription = mongoose.model<
  IPushSubscription,
  IPushSubscriptionModel
>("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;



