import { Document, Model, Types } from "mongoose";

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
  // Optional relations commonly accessed in controllers
  shop?: Types.ObjectId;
  // Legacy fields accessed by some controllers
  verificationStatus?: "pending" | "approved" | "rejected" | "not_submitted";
  verification?: any;

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
  owner: Types.ObjectId; // User ID
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
  performanceMetrics: {
    totalOrders: number;
    cancelledOrders: number;
    cancellationRate: number;
    averageDeliveryTime: number;
    complaintsCount: number;
    disputesCount: number;
    disputesWon: number;
    disputesLost: number;
    refundCount: number;
    refundAmount: number;
    lastUpdated: Date;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: Date;
    badge: "basic" | "trusted" | "premium" | null;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  shopUrl: string;
  products: any[];
  
  // Instance methods
  updateStats(): Promise<void>;
  updatePerformanceMetrics(): Promise<void>;
}

export interface IShopModel extends Model<IShop> {
  isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  updateRatingStats?(shopId: string | Types.ObjectId): Promise<void>;
}

// Product Types
export interface IProduct extends Document {
  _id: string;
  shop: Types.ObjectId; // Shop ID
  seller: Types.ObjectId; // User ID
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
  
  // Virtual properties
  discountPercentage: number;
  isInStock: boolean;
  formattedPrice: string;
  
  // Instance methods
  incrementViews(): Promise<IProduct>;
  generateSku(): void;
  validateImages(): void;
  validatePricing(): void;
}

export interface IProductModel extends Model<IProduct> {
  findFeatured(limit?: number): Promise<IProduct[]>;
  updateRatingStats?(productId: string | Types.ObjectId): Promise<void>;
}

// Order Types
export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  buyer: Types.ObjectId; // User ID
  seller: Types.ObjectId; // User ID
  shop: Types.ObjectId; // Shop ID
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
  // Some controllers use legacy `deliveryInfo` structure
  deliveryInfo?: {
    provider?: string;
    trackingNumber?: string;
    status?: string;
    currentLocation?: string;
    estimatedDelivery?: Date;
    cost?: number;
  };
  timeline: IOrderTimeline[];
  notes?: string;
  escrowReference?: string;
  escrowCreatedAt?: Date;
  escrowReleasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  ageInDays: number;
  totalItems: number;
  canBeCancelled: boolean;
  canBeReturned: boolean;
  
  // Instance methods
  updateStatus(status: string, note?: string): Promise<IOrder>;
  canUpdateStatus(status: string): boolean;
  getTimeAgo(): string;
}

export interface IOrderModel extends Model<IOrder> {
  getOrdersByStatus(status: string, userId: string, userRole: string): Promise<IOrder[]>;
}

export interface IOrderItem {
  product: Types.ObjectId; // Product ID
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
  participants: Types.ObjectId[]; // User IDs [buyer, seller]
  product?: Types.ObjectId; // Product ID (optional, for product inquiries)
  shop: Types.ObjectId; // Shop ID
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
  sender: Types.ObjectId; // User ID
  content: string;
  type: "text" | "image" | "product" | "order";
  attachments?: string[];
  metadata?: {
    productId?: string;
    orderId?: string;
  };
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
  timestamp: Date;
}

// Review Types
export interface IReview extends Document {
  _id: string;
  reviewer: Types.ObjectId; // User ID (buyer)
  shop: Types.ObjectId; // Shop ID
  product?: Types.ObjectId; // Product ID (optional)
  order: Types.ObjectId; // Order ID
  rating: number; // 1-5 stars
  title?: string;
  comment?: string;
  images?: string[];
  response?: {
    comment: string;
    respondedAt: Date;
  };
  helpful: Types.ObjectId[]; // Array of User IDs who found review helpful
  helpfulVotes: Types.ObjectId[]; // Array of User IDs who found review helpful
  reports: Array<{
    reporter: Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  status: "published" | "pending" | "hidden";
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  helpfulCount: number;
  hasResponse: boolean;
  
  // Instance methods
  addResponse(responseComment: string): Promise<IReview>;
  toggleHelpful(userId: string): Promise<IReview>;
  isHelpfulByUser(userId: string): boolean;
  canBeEditedBy(userId: string): boolean;
}

export interface IReviewModel extends Model<IReview> {
  getShopReviews(shopId: string, page?: number, limit?: number, rating?: number): Promise<IReview[]>;
  getProductReviews(productId: string, page?: number, limit?: number): Promise<IReview[]>;
  getReviewStats(shopId: string): Promise<any>;
}

// Payment Types
export interface ITransaction extends Document {
  _id: string;
  user: Types.ObjectId; // User ID
  order?: Types.ObjectId; // Order ID
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
  
  // Virtual properties
  formattedAmount: string;
  
  // Instance methods
  updateStatus(status: string, gatewayResponse?: any): Promise<ITransaction>;
  markAsSuccessful(gatewayResponse?: any): Promise<ITransaction>;
  markAsFailed(gatewayResponse?: any): Promise<ITransaction>;
}

export interface ITransactionModel extends Model<ITransaction> {
  findByReference(reference: string): Promise<ITransaction | null>;
  getUserTransactions(userId: string, type?: string, page?: number, limit?: number): Promise<ITransaction[]>;
  getTransactionStats(userId: string, period?: "day" | "week" | "month" | "year"): Promise<any[]>;
}

// Notification Types
export interface INotification extends Document {
  _id: string;
  recipient: Types.ObjectId; // User ID
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
  // Convenience helpers referenced by controllers
  createForAdmins?(title: string, message: string, data?: any): Promise<any>;
  createForUser?(userId: string, title: string, message: string, data?: any): Promise<any>;
}

// Wishlist Types
export interface IWishlistItem {
  product: Types.ObjectId; // Product ID
  addedAt: Date;
}

export interface IWishlist extends Document {
  _id: string;
  user: Types.ObjectId; // User ID
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  itemsCount: number;
  
  // Instance methods
  addItem(productId: string): Promise<IWishlist>;
  removeItem(productId: string): Promise<IWishlist>;
  hasItem(productId: string): boolean;
  clearWishlist(): Promise<IWishlist>;
}

export interface IWishlistModel extends Model<IWishlist> {
  findByUser(userId: string): Promise<IWishlist | null>;
  getPopularProducts(limit?: number): Promise<any[]>;
}

// Cart Types
export interface ICartItem {
  product: Types.ObjectId; // Product ID
  title: string;
  price: number;
  quantity: number;
  image: string;
  shop?: Types.ObjectId; // Shop ID
}

export interface ICart extends Document {
  _id: string;
  user: Types.ObjectId; // User ID
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: Types.ObjectId; // Parent category ID for subcategories
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  productCount: number;
  
  // Static methods
  getMainCategories(): Promise<ICategory[]>;
  getSubcategories(parentId: string): Promise<ICategory[]>;
}

export interface ICategoryModel extends Model<ICategory> {
  getMainCategories(): Promise<ICategory[]>;
  getSubcategories(parentId: string): Promise<ICategory[]>;
}

// NotificationCenter Types
export interface INotificationCenter extends Document {
  _id: string;
  user: Types.ObjectId; // User ID
  type: "order" | "payment" | "message" | "review" | "system";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  channels: ("email" | "sms" | "push")[];
  priority: "low" | "medium" | "high";
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  markAsRead(): Promise<INotificationCenter>;
  getTimeAgo(): string;
}

export interface INotificationCenterModel extends Model<INotificationCenter> {
  getUserNotifications(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      type?: string;
      unreadOnly?: boolean;
    }
  ): Promise<{
    notifications: INotificationCenter[];
    total: number;
    unreadCount: number;
  }>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationIds: string[], userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<any>;
  createNotification(data: any): Promise<INotificationCenter>;
  createForUser(
    userId: string,
    type: string,
    title: string,
    message: string,
    options?: Partial<INotificationCenter>
  ): Promise<INotificationCenter>;
}

// PushSubscription Types
export interface IPushSubscription extends Document {
  _id: string;
  user: Types.ObjectId; // User ID
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceType?: "web" | "mobile" | "tablet";
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPushSubscriptionModel extends Model<IPushSubscription> {
  findByUser(userId: string): Promise<IPushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<IPushSubscription | null>;
  findActiveByUser?(userId: string): Promise<IPushSubscription[]>;
  deactivateOldSubscriptions?(userId: string, keepCount?: number): Promise<number>;
}

// Coupon Types
export interface ICoupon extends Document {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  startsAt: Date;
  expiresAt: Date;
  applicableTo: "all" | "category" | "product" | "shop";
  applicableIds: Types.ObjectId[];
  createdBy: Types.ObjectId;
  totalUsageLimit?: number;
  currentUsageCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isValid(): boolean;
  canBeUsedByUser(userId: string): boolean;
  calculateDiscount(orderAmount: number): number;
}

export interface ICouponModel extends Model<ICoupon> {
  findByCode(code: string): Promise<ICoupon | null>;
  getValidCoupons(): Promise<ICoupon[]>;
}
