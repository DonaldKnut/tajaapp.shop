import mongoose, { Schema, Document } from "mongoose";

interface CartItem {
  product: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image: string;
  shop?: mongoose.Types.ObjectId;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const cartItemSchema = new Schema<CartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    image: { type: String, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });

export default mongoose.model<ICart>("Cart", cartSchema);

