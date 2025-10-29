"use client";

import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function FloatingCart() {
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-taja-primary text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-all btn-hover flex items-center justify-center"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-taja-secondary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleCart}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-2">Start shopping to add items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        {item.images && item.images[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {item.title}
                        </h3>
                        <p className="text-taja-primary font-semibold mt-1">
                          ₦{item.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="ml-auto p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-taja-primary">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-taja-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors btn-hover"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
