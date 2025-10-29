import { Document, Model } from "mongoose";

// User Types
export interface IUser extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin";
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneVerificationCode?: string;
  phoneVerificationExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  verificationData?: {
    nin?: string;
    ninVerified: boolean;
    selfieUrl?: string;
    selfieVerified: boolean;
    verificationStatus: "pending" | "approved" | "rejected";
    verifiedAt?: Date;
    rejectionReason?: string;
  };
  addresses: IAddress[];
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    categories: string[];
  };
  fraudFlags?: {
    suspiciousActivity: boolean;
    multipleAccounts: boolean;
    highCancellationRate: boolean;
    flaggedBy?: string;
    flaggedAt?: Date;
    reason?: string;
  };
  accountStatus: "active" | "suspended" | "banned" | "under_review";
  lastLoginAt?: Date;
  lastLoginIp?: string;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods defined on the schema
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): any;
}

export interface IAddress {
  _id?: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

// Shop Types
export interface IShop extends Document {
  _id: string;
  owner: string; // User ID
  shopName: string;
  shopSlug: string; // URL slug (e.g., taja.shop/shopSlug)
  description: string;
  logo?: string;
  banner?: string;
  categories: string[];
  socialLinks: {
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
    facebook?: string;
  };
  businessInfo: {
    businessType: "individual" | "business";
    businessName?: string;
    businessAddress?: string;
    cacNumber?: string;
  };
  settings: {
    isActive: boolean;
    acceptsOrders: boolean;
    responseTime: string;
    shippingMethods: string[];
    returnPolicy: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: Date;
    badge: "basic" | "trusted" | "premium" | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProduct extends Document {
  _id: string;
  shop: string; // Shop ID
  seller: string; // User ID
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  price: number;
  compareAtPrice?: number; // Original price for discounts
  currency: "NGN";
  images: string[];
  videos?: {
    url: string;
    thumbnail?: string;
    duration?: number; // in seconds
    type: "video";
  }[];
  specifications: {
    brand?: string;
    size?: string;
    color?: string;
    material?: string;
    gender?: "men" | "women" | "unisex" | "kids";
    [key: string]: any;
  };
  inventory: {
    quantity: number;
    sku?: string;
    trackQuantity: boolean;
  };
  shipping: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
    shippingCost: number;
    processingTime: string;
  };
  seo: {
    tags: string[];
    metaTitle?: string;
    metaDescription?: string;
  };
  status: "active" | "draft" | "sold" | "archived";
  featured: boolean;
  stats: {
    views: number;
    likes: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  buyer: string; // User ID
  seller: string; // User ID
  shop: string; // Shop ID
  items: IOrderItem[];
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "escrowed";
  paymentMethod: "card" | "bank_transfer" | "ussd";
  paymentReference: string;
  escrowStatus: "pending" | "funded" | "released" | "refunded";
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  delivery: {
    method: "pickup" | "delivery";
    provider?: "gokada" | "kwik" | "bolt" | "custom";
    trackingNumber?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    deliveryFee: number;
  };
  timeline: IOrderTimeline[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: string; // Product ID
  title: string;
  image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  note?: string;
}

// Chat Types
export interface IChat extends Document {
  _id: string;
  participants: string[]; // User IDs [buyer, seller]
  product?: string; // Product ID (optional, for product inquiries)
  shop: string; // Shop ID
  messages: IMessage[];
  status: "active" | "archived" | "blocked";
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addMessage(
    senderId: string,
    content: string,
    type?: string,
    attachments?: string[],
    metadata?: any
  ): Promise<IChat>;
  markAsRead(userId: string): Promise<IChat>;
  getUnreadCount(userId: string): number;
  isParticipant(userId: string): boolean;
  getOtherParticipant(userId: string): string | undefined;
  blockChat(userId: string): Promise<IChat>;
  archiveChat(userId: string): Promise<IChat>;
}

export interface IChatModel extends Model<IChat> {
  findByParticipants(
    userId1: string,
    userId2: string,
    productId?: string
  ): Promise<IChat | null>;
  findUserChats(userId: string, limit?: number): Promise<IChat[]>;
}

export interface IMessage {
  _id: string;
  sender: string; // User ID
  content: string;
  type: "text" | "image" | "product" | "order";
  attachments?: string[];
  metadata?: {
    productId?: string;
    orderId?: string;
  };
  readBy: {
    user: string;
    readAt: Date;
  }[];
  timestamp: Date;
}

// Review Types
export interface IReview extends Document {
  _id: string;
  reviewer: string; // User ID (buyer)
  shop: string; // Shop ID
  product?: string; // Product ID (optional)
  order: string; // Order ID
  rating: number; // 1-5 stars
  title?: string;
  comment?: string;
  images?: string[];
  response?: {
    comment: string;
    respondedAt: Date;
  };
  helpful: string[]; // Array of User IDs who found review helpful
  status: "published" | "pending" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface ITransaction extends Document {
  _id: string;
  user: string; // User ID
  order?: string; // Order ID
  type: "payment" | "payout" | "refund" | "fee";
  amount: number;
  currency: "NGN";
  status: "pending" | "successful" | "failed" | "cancelled";
  gateway: "flutterwave" | "paystack";
  reference: string;
  gatewayResponse?: any;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface INotification extends Document {
  _id: string;
  recipient: string; // User ID
  type: "order" | "payment" | "message" | "review" | "system";
  title: string;
  message: string;
  data?: any; // Additional data (order ID, product ID, etc.)
  read: boolean;
  readAt?: Date;
  channels: ("email" | "sms" | "push")[];
  createdAt: Date;

  // Instance methods
  markAsRead(): Promise<INotification>;
  getTimeAgo(): string;
}

export interface INotificationModel extends Model<INotification> {
  getUserNotifications(
    userId: string,
    page?: number,
    limit?: number,
    unreadOnly?: boolean
  ): Promise<INotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<any>;
  createNotification(data: {
    recipient: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    channels?: string[];
  }): Promise<INotification>;
  createOrderNotification(
    orderId: string,
    buyerId: string,
    sellerId: string,
    type: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled"
  ): Promise<INotification[]>;
}

// Category Types
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: string; // Parent category ID for subcategories
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
