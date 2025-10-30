"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getCart, mergeCart } from "@/services/cart";

export function useServerCartSync(token?: string | null) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const addItem = useCartStore((s) => s.addItem);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!token) return;
    const doSync = async () => {
      try {
        // Merge local items to server
        if (firstRun.current && items.length > 0) {
          await mergeCart(
            items.map((i) => ({ product: i._id, quantity: i.quantity })),
            token || undefined
          );
          firstRun.current = false;
        }

        // Pull server cart and hydrate local
        const server = await getCart(token || undefined);
        if (server?.success && server.data?.items) {
          clearCart();
          for (const it of server.data.items) {
            addItem({
              _id: it.product,
              title: it.title,
              price: it.price,
              images: [it.image],
              seller: "",
              shopSlug: "",
            });
            if (it.quantity > 1) {
              // set to final quantity by calling addItem multiple times
              // or ideally we would have a setQuantity method exposed
              // fallback loop to avoid changing store API
              for (let k = 1; k < it.quantity; k++)
                addItem({
                  _id: it.product,
                  title: it.title,
                  price: it.price,
                  images: [it.image],
                  seller: "",
                  shopSlug: "",
                });
            }
          }
        }
      } catch (_) {}
    };
    doSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}


