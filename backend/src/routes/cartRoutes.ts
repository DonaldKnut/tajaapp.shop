import express from "express";
import { protect } from "../middleware/authMiddleware";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";

const router = express.Router();

// Get current user's cart
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    res.json({ success: true, data: cart || { items: [] } });
  })
);

// Merge guest cart into user's cart
router.post(
  "/merge",
  protect,
  asyncHandler(async (req, res) => {
    const { items } = req.body as {
      items: Array<{ product: string; quantity: number }>;
    };
    const existing =
      (await Cart.findOne({ user: req.user._id })) ||
      new Cart({ user: req.user._id, items: [] });

    // Build map for quick merge
    const idToIndex = new Map(
      existing.items.map((it, idx) => [it.product.toString(), idx])
    );

    for (const gi of items || []) {
      const pid = gi.product;
      const qty = Math.max(1, Math.min(gi.quantity || 1, 99));
      const index = idToIndex.get(pid);

      // Load product snapshot if adding new
      if (index === undefined) {
        const p = await Product.findOne({ _id: pid, status: "active" }).select(
          "title price images shop"
        );
        if (!p) continue;
        existing.items.push({
          product: (p as any)._id as any,
          title: p.title,
          price: p.price,
          quantity: qty,
          image: p.images?.[0] || "",
          shop: (p as any).shop,
        });
        idToIndex.set(pid, existing.items.length - 1);
      } else {
        existing.items[index].quantity = Math.min(
          99,
          existing.items[index].quantity + qty
        );
      }
    }

    await existing.save();
    res.json({ success: true, data: existing });
  })
);

// Add or update a single item (idempotent by product)
router.post(
  "/items",
  protect,
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body as {
      productId: string;
      quantity?: number;
    };
    if (!productId) throw new ApiErrorClass("productId is required", 400);

    const qty = Math.max(1, Math.min(quantity || 1, 99));
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx === -1) {
      const p = await Product.findOne({
        _id: productId,
        status: "active",
      }).select("title price images shop");
      if (!p) throw new ApiErrorClass("Product unavailable", 404);
      cart.items.push({
        product: (p as any)._id as any,
        title: p.title,
        price: p.price,
        quantity: qty,
        image: p.images?.[0] || "",
        shop: (p as any).shop,
      });
    } else {
      cart.items[idx].quantity = qty;
    }

    await cart.save();
    res.json({ success: true, data: cart });
  })
);

// Update quantity
router.put(
  "/items/:productId",
  protect,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body as { quantity: number };
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiErrorClass("Cart not found", 404);

    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx === -1) throw new ApiErrorClass("Item not in cart", 404);

    const qty = Math.max(0, Math.min(quantity || 0, 99));
    if (qty === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = qty;
    }

    await cart.save();
    res.json({ success: true, data: cart });
  })
);

// Remove item
router.delete(
  "/items/:productId",
  protect,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ success: true, data: { items: [] } });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json({ success: true, data: cart });
  })
);

// Clear cart
router.delete(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, data: cart || { items: [] } });
  })
);

export default router;

