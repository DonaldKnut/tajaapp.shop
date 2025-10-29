import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IProduct } from "./Product";

export interface IWishlistItem {
  product: IProduct["_id"];
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: IUser["_id"];
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addItem(productId: string): Promise<IWishlist>;
  removeItem(productId: string): Promise<IWishlist>;
  hasItem(productId: string): boolean;
  clearWishlist(): Promise<IWishlist>;
}

export interface IWishlistModel extends mongoose.Model<IWishlist> {
  // Static methods
  findByUser(userId: string): Promise<IWishlist | null>;
  getPopularProducts(limit?: number): Promise<any[]>;
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ "items.product": 1 });
wishlistSchema.index({ "items.addedAt": -1 });

// Virtual for items count
wishlistSchema.virtual("itemsCount").get(function () {
  return this.items.length;
});

// Instance Methods
wishlistSchema.methods.addItem = async function (
  productId: string
): Promise<IWishlist> {
  // Check if item already exists
  const existingItem = this.items.find(
    (item: IWishlistItem) => item.product.toString() === productId
  );

  if (existingItem) {
    throw new Error("Product already in wishlist");
  }

  // Add new item
  this.items.unshift({
    product: productId,
    addedAt: new Date(),
  });

  return await this.save();
};

wishlistSchema.methods.removeItem = async function (
  productId: string
): Promise<IWishlist> {
  this.items = this.items.filter(
    (item: IWishlistItem) => item.product.toString() !== productId
  );

  return await this.save();
};

wishlistSchema.methods.hasItem = function (productId: string): boolean {
  return this.items.some(
    (item: IWishlistItem) => item.product.toString() === productId
  );
};

wishlistSchema.methods.clearWishlist = async function (): Promise<IWishlist> {
  this.items = [];
  return await this.save();
};

// Static Methods
wishlistSchema.statics.findByUser = async function (
  userId: string
): Promise<IWishlist | null> {
  return await this.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "shop",
      select: "shopName isVerified",
    },
  });
};

wishlistSchema.statics.getPopularProducts = async function (
  limit = 20
): Promise<any[]> {
  return await this.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        count: { $sum: 1 },
        latestAddedAt: { $max: "$items.addedAt" },
      },
    },
    { $sort: { count: -1, latestAddedAt: -1 } },
    { $limit: limit },
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
      $lookup: {
        from: "shops",
        localField: "product.shop",
        foreignField: "_id",
        as: "shop",
      },
    },
    { $unwind: "$shop" },
    {
      $project: {
        _id: "$product._id",
        title: "$product.title",
        price: "$product.price",
        images: "$product.images",
        rating: "$product.rating",
        wishlisted: "$count",
        shop: {
          _id: "$shop._id",
          shopName: "$shop.shopName",
          isVerified: "$shop.isVerified",
        },
      },
    },
  ]);
};

// Pre-save middleware
wishlistSchema.pre("save", function (next) {
  // Remove duplicates based on product ID
  const seen = new Set();
  this.items = this.items.filter((item: IWishlistItem) => {
    const productId = item.product.toString();
    if (seen.has(productId)) {
      return false;
    }
    seen.add(productId);
    return true;
  });

  next();
});

const Wishlist = mongoose.model<IWishlist, IWishlistModel>(
  "Wishlist",
  wishlistSchema
);
export default Wishlist;



