"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Grid,
  List,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ImageSlider } from "@/components/ui/ImageSlider";

// Mock data - replace with API calls
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
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=400",
    ],
    condition: "like-new",
    shop: {
      shopName: "Amina Thrift",
      shopSlug: "amina-thrift",
      isVerified: true,
      averageRating: 4.8,
    },
    location: "Lagos",
    createdAt: new Date(),
  },
  {
    id: "2",
    slug: "handmade-ankara-bag",
    title: "Handmade Ankara Bag",
    price: 8000,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    ],
    condition: "new",
    shop: {
      shopName: "Kemi Crafts",
      shopSlug: "kemi-crafts",
      isVerified: true,
      averageRating: 4.9,
    },
    location: "Abuja",
    createdAt: new Date(),
  },
  {
    id: "3",
    slug: "designer-sneakers",
    title: "Designer Sneakers",
    price: 45000,
    compareAtPrice: 80000,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400",
    ],
    condition: "good",
    shop: {
      shopName: "SneakerHub",
      shopSlug: "sneakerhub",
      isVerified: false,
      averageRating: 4.2,
    },
    location: "Lagos",
    createdAt: new Date(),
  },
  {
    id: "4",
    slug: "vintage-leather-boots",
    title: "Vintage Leather Boots",
    price: 35000,
    compareAtPrice: 55000,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400",
      "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400",
    ],
    condition: "excellent",
    shop: {
      shopName: "Classic Vintage",
      shopSlug: "classic-vintage",
      isVerified: true,
      averageRating: 4.6,
    },
    location: "Port Harcourt",
    createdAt: new Date(),
  },
  {
    id: "5",
    slug: "retro-sunglasses",
    title: "Retro Sunglasses Collection",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    ],
    condition: "excellent",
    shop: {
      shopName: "Retro Vision",
      shopSlug: "retro-vision",
      isVerified: false,
      averageRating: 4.3,
    },
    location: "Ibadan",
    createdAt: new Date(),
  },
  {
    id: "6",
    slug: "handcrafted-jewelry-set",
    title: "Handcrafted Jewelry Set",
    price: 18000,
    compareAtPrice: 28000,
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400",
      "https://images.unsplash.com/photo-1613181638244-5c4fb05685c5?w=400",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    ],
    condition: "new",
    shop: {
      shopName: "Adunni Jewels",
      shopSlug: "adunni-jewels",
      isVerified: true,
      averageRating: 4.9,
    },
    location: "Lagos",
    createdAt: new Date(),
  },
];

const categories = [
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Sports",
  "Accessories",
  "Books",
  "Art & Crafts",
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

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Add wishlist functionality
          }}
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Discount Badge */}
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

        {/* Condition Badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs capitalize z-10">
          {product.condition}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-taja-primary transition-colors line-clamp-2 mb-2">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/shop/${product.shop.shopSlug}`}
            className="text-sm text-gray-600 hover:text-taja-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {product.shop.shopName}
          </Link>
          {product.shop.isVerified && (
            <div className="bg-taja-primary/10 text-taja-primary px-2 py-0.5 rounded text-xs font-medium">
              Verified
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₦{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{product.shop.averageRating}</span>
          </div>
        </div>
      </CardContent>
    </Link>
  </Card>
);

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-taja-primary" />
              <span className="text-2xl font-bold text-taja-dark">
                Taja.Shop
              </span>
            </Link>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for products, shops..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-taja-primary"
              >
                Login
              </Link>
              <Link href="/register">
                <Button>Start Selling</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600">View:</span>
            <Button variant="ghost" size="icon">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">1-{mockProducts.length}</span> of{" "}
            <span className="font-semibold">2,847</span> products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" className="px-8">
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  );
}
