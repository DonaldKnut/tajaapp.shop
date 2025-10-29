"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: {
    name: string;
    shop: string;
    rating: number;
  };
  addedDate: string;
  inStock: boolean;
  category: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // TODO: Fetch wishlist from API
    // Mock data for now
    setWishlistItems([
      {
        id: "1",
        productId: "prod-1",
        name: "Vintage Denim Jacket",
        price: 15000,
        originalPrice: 20000,
        image: "/placeholder-product.jpg",
        seller: {
          name: "Jane Smith",
          shop: "Vintage Finds",
          rating: 4.8,
        },
        addedDate: "2024-01-15",
        inStock: true,
        category: "fashion",
      },
      {
        id: "2",
        productId: "prod-2",
        name: "Leather Handbag",
        price: 12000,
        image: "/placeholder-product.jpg",
        seller: {
          name: "Mike Johnson",
          shop: "Fashion Forward",
          rating: 4.6,
        },
        addedDate: "2024-01-18",
        inStock: true,
        category: "fashion",
      },
      {
        id: "3",
        productId: "prod-3",
        name: "Wireless Headphones",
        price: 25000,
        image: "/placeholder-product.jpg",
        seller: {
          name: "Tech Store",
          shop: "Electronics Hub",
          rating: 4.9,
        },
        addedDate: "2024-01-20",
        inStock: false,
        category: "electronics",
      },
      {
        id: "4",
        productId: "prod-4",
        name: "Designer Sunglasses",
        price: 18000,
        image: "/placeholder-product.jpg",
        seller: {
          name: "Sarah Wilson",
          shop: "Style Studio",
          rating: 4.7,
        },
        addedDate: "2024-01-22",
        inStock: true,
        category: "fashion",
      },
    ]);
  }, []);

  useEffect(() => {
    let filtered = wishlistItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.seller.shop.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, categoryFilter]);

  const handleRemoveFromWishlist = async (itemId: string) => {
    setLoading(true);
    try {
      // TODO: Remove from wishlist via API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setLoading(true);
    try {
      // TODO: Add to cart via API
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Remove from wishlist after adding to cart
      setWishlistItems((prev) =>
        prev.filter((wishlistItem) => wishlistItem.id !== item.id)
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {wishlistItems.length} items saved for later
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Garden</option>
                <option value="beauty">Beauty</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option>Recently Added</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Name: A to Z</option>
                <option>Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      {filteredItems.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white shadow rounded-lg ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {viewMode === "grid" ? (
                // Grid View
                <>
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        ₦{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₦{item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(item.seller.rating)}
                      <span className="text-xs text-gray-500">
                        ({item.seller.rating})
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      by {item.seller.shop}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        href={`/product/${item.productId}`}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        disabled={!item.inStock || loading}
                        onClick={() => handleAddToCart(item)}
                        className="flex-1"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {item.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                    {!item.inStock && (
                      <Badge className="mt-2 bg-red-100 text-red-800">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-semibold text-gray-900">
                            ₦{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₦{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          {renderStars(item.seller.rating)}
                          <span className="text-sm text-gray-500">
                            {item.seller.rating} • {item.seller.shop}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Added on{" "}
                          {new Date(item.addedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          disabled={loading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <Link href={`/product/${item.productId}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          disabled={!item.inStock || loading}
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {item.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                    {!item.inStock && (
                      <Badge className="mt-2 bg-red-100 text-red-800">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No items in wishlist
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Start adding items you love to your wishlist."}
          </p>
          {!searchTerm && categoryFilter === "all" && (
            <div className="mt-6">
              <Link href="/marketplace">
                <Button>Browse Products</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

