"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  Package,
  Users,
  MapPin,
  MessageCircle,
  Heart,
  Grid,
  List,
  Filter,
  Search,
  ShoppingBag,
  Shield,
  Truck,
  Clock,
  Instagram,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ImageSlider } from "@/components/ui/ImageSlider";

// Mock shop data - replace with API call
const mockShop = {
  id: "1",
  shopSlug: "amina-thrift",
  shopName: "Amina Thrift",
  tagline: "Vintage Finds & Fashion Treasures",
  description:
    "Welcome to Amina Thrift! We specialize in carefully curated vintage clothing, accessories, and unique fashion pieces. Every item is hand-picked for quality and style. From designer pieces to everyday essentials, find your perfect vintage look.",
  longDescription: `At Amina Thrift, we're passionate about sustainable fashion and bringing you unique, high-quality vintage pieces. Our carefully curated collection includes:

• Designer vintage clothing
• Authentic accessories
• One-of-a-kind fashion finds
• Gently used and like-new items

We take pride in describing each item accurately and providing detailed photos so you know exactly what you're getting. All items are carefully inspected before listing.`,
  logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
  banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
  isVerified: true,
  averageRating: 4.8,
  totalReviews: 127,
  totalProducts: 45,
  followers: 1234,
  following: 89,
  location: "Lagos, Nigeria",
  joinedDate: "March 2023",
  policies: {
    returnPolicy: "7-day return policy. Items must be in original condition.",
    shippingPolicy:
      "Free shipping on orders over ₦10,000. Delivery in 2-5 business days.",
    paymentPolicy:
      "Secure escrow payment. Money released only after delivery confirmation.",
  },
  contact: {
    email: "shop@aminathrift.com",
    phone: "+234 812 345 6789",
  },
  categories: ["Clothing", "Accessories", "Shoes"],
  socialLinks: {
    instagram: "aminathrift_ng", // Instagram username
    whatsapp: "2348123456789", // WhatsApp number in international format (without +)
    twitter: "",
    facebook: "",
  },
};

// Mock products from this shop
const mockProducts = [
  {
    id: "1",
    slug: "vintage-denim-jacket",
    title: "Vintage Denim Jacket",
    price: 15000,
    compareAtPrice: 25000,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
    ],
    condition: "like-new",
    location: "Lagos",
  },
  {
    id: "2",
    slug: "retro-handbag",
    title: "Retro Leather Handbag",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    ],
    condition: "excellent",
    location: "Lagos",
  },
  {
    id: "3",
    slug: "vintage-dress",
    title: "Vintage Floral Dress",
    price: 18000,
    compareAtPrice: 28000,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
    ],
    condition: "like-new",
    location: "Lagos",
  },
  {
    id: "4",
    slug: "designer-blazer",
    title: "Designer Blazer",
    price: 25000,
    images: [
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=400",
    ],
    condition: "excellent",
    location: "Lagos",
  },
];

const ProductCard = ({ product }: { product: any }) => (
  <Card className="group hover:shadow-lg transition-all duration-200 card-hover overflow-hidden">
    <Link href={`/product/${product.slug}`} className="block">
      <div className="relative">
        <ImageSlider
          images={product.images}
          alt={product.title}
          className="h-56 w-full"
          aspectRatio="landscape"
          showDots={true}
          showArrows={true}
          autoPlay={false}
        />
        {product.compareAtPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
            {Math.round(
              ((product.compareAtPrice - product.price) /
                product.compareAtPrice) *
                100
            )}
            % OFF
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs capitalize z-10">
          {product.condition}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-taja-primary transition-colors line-clamp-2 mb-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ₦{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₦{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Link>
  </Card>
);

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState(mockShop);
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [isFollowing, setIsFollowing] = useState(false);

  // Format WhatsApp URL with optional message
  const getWhatsAppUrl = (whatsapp: string, message?: string) => {
    if (!whatsapp) return null;
    // Remove any +, spaces, or dashes
    const cleanNumber = whatsapp.replace(/[\s\+\-]/g, "");
    // Check if it's already a URL
    if (whatsapp.startsWith("http")) return whatsapp;
    // Format as wa.me link with optional message
    const baseUrl = `https://wa.me/${cleanNumber}`;
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      return `${baseUrl}?text=${encodedMessage}`;
    }
    return baseUrl;
  };

  // Format Instagram URL
  const getInstagramUrl = (instagram: string) => {
    if (!instagram) return null;
    // Remove @ symbol if present
    const username = instagram.replace(/^@/, "");
    // Check if it's already a URL
    if (instagram.startsWith("http")) return instagram;
    // Format as Instagram profile link
    return `https://instagram.com/${username}`;
  };

  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchShop = async () => {
    //   try {
    //     const response = await fetch(
    //       `${process.env.NEXT_PUBLIC_API_URL}/api/shops/${params.slug}`
    //     );
    //     const data = await response.json();
    //     setShop(data.data);
    //   } catch (error) {
    //     console.error("Error fetching shop:", error);
    //   }
    // };
    // fetchShop();
  }, [params.slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "recent":
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taja-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-black/20"></div>
        {shop.banner && (
          <Image
            src={shop.banner}
            alt={shop.shopName}
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}

        {/* Shop Info Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex items-end gap-6 w-full">
            {/* Logo */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              {shop.logo && (
                <Image
                  src={shop.logo}
                  alt={shop.shopName}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {shop.shopName}
                </h1>
                {shop.isVerified && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-white/90 mb-3">{shop.tagline}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{shop.averageRating}</span>
                  <span className="text-white/80">
                    ({shop.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{shop.location}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span>Joined {shop.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp Link */}
              {shop.socialLinks?.whatsapp && (
                <a
                  href={getWhatsAppUrl(shop.socialLinks.whatsapp) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {/* Instagram Link */}
              {shop.socialLinks?.instagram && (
                <a
                  href={getInstagramUrl(shop.socialLinks.instagram) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {/* Primary WhatsApp button if available, otherwise hide Message button */}
              {shop.socialLinks?.whatsapp ? (
                <a
                  href={
                    getWhatsAppUrl(
                      shop.socialLinks.whatsapp,
                      `Hi! I'm interested in shopping from ${shop.shopName}. Can you help me?`
                    ) || "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 border border-white/50 rounded-lg transition-colors font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message on WhatsApp
                </a>
              ) : null}
              <Button
                variant="outline"
                className={
                  isFollowing
                    ? "bg-white"
                    : "bg-taja-primary text-white hover:bg-emerald-600"
                }
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isFollowing ? "fill-current" : ""
                  }`}
                />
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              {/* Stats Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-5 w-5" />
                        <span>Products</span>
                      </div>
                      <span className="font-semibold">
                        {shop.totalProducts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-5 w-5" />
                        <span>Followers</span>
                      </div>
                      <span className="font-semibold">{shop.followers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="h-5 w-5" />
                        <span>Rating</span>
                      </div>
                      <span className="font-semibold">
                        {shop.averageRating}/5
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shop Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Shop Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">{shop.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Categories</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {shop.categories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-gray-100 px-2 py-1 rounded text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Links */}
                    {(shop.socialLinks?.whatsapp ||
                      shop.socialLinks?.instagram) && (
                      <div className="pt-3 border-t">
                        <p className="text-gray-600 mb-2">Connect With Us</p>
                        <div className="flex flex-col gap-2">
                          {shop.socialLinks?.whatsapp && (
                            <a
                              href={
                                getWhatsAppUrl(
                                  shop.socialLinks.whatsapp,
                                  `Hi! I'm interested in shopping from ${shop.shopName}. Can you help me?`
                                ) || "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Phone className="h-4 w-4" />
                              Chat on WhatsApp
                            </a>
                          )}
                          {shop.socialLinks?.instagram && (
                            <a
                              href={
                                getInstagramUrl(shop.socialLinks.instagram) ||
                                "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Instagram className="h-4 w-4" />
                              Follow on Instagram
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Direct links to stay connected! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Policies */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Shop Policies</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-taja-primary" />
                        <span className="font-medium">Returns</span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {shop.policies.returnPolicy}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-4 w-4 text-taja-primary" />
                        <span className="font-medium">Shipping</span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {shop.policies.shippingPolicy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-3">About This Shop</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {shop.description}
                </p>
                <div className="text-gray-600 whitespace-pre-line text-sm">
                  {shop.longDescription}
                </div>
              </CardContent>
            </Card>

            {/* Products Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                Products ({products.length})
              </h2>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-taja-primary"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-taja-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-taja-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
