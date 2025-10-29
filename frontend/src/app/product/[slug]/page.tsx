"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  ChevronLeft,
  Share2,
  MapPin,
  CheckCircle,
  Minus,
  Plus,
  Phone,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { useCartStore } from "@/stores/cartStore";
import toast from "react-hot-toast";

// Mock product data - replace with API call
const mockProduct = {
  id: "1",
  slug: "vintage-denim-jacket",
  title: "Vintage Denim Jacket",
  description:
    "A stunning vintage denim jacket in excellent condition. Perfect for casual wear and fashion-forward looks. Made from high-quality denim that has been carefully maintained. This piece features a classic fit and timeless style that never goes out of fashion.",
  longDescription: `This beautiful vintage denim jacket is a must-have for any fashion enthusiast. Crafted from premium denim fabric, it offers both comfort and style.

Features:
• Classic fit with adjustable cuffs
• Multiple pockets for functionality
• Durable construction
• Vintage wash finish
• Authentic vintage styling

This jacket has been carefully maintained and is in excellent condition. It's perfect for layering in colder months or as a statement piece in warmer weather. The timeless design makes it versatile for various occasions.`,
  price: 15000,
  compareAtPrice: 25000,
  stock: 5,
  images: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800",
    "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800",
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800",
  ],
  condition: "like-new",
  category: "Clothing",
  location: "Lagos",
  createdAt: new Date(),
  views: 1245,
  shop: {
    shopName: "Amina Thrift",
    shopSlug: "amina-thrift",
    isVerified: true,
    averageRating: 4.8,
    totalProducts: 45,
    followers: 1234,
    since: "2023",
    socialLinks: {
      instagram: "aminathrift_ng",
      whatsapp: "2348123456789",
    },
  },
  reviews: [
    {
      id: "1",
      userName: "Sarah M.",
      rating: 5,
      comment: "Love this jacket! Perfect fit and condition is amazing.",
      date: "2024-01-15",
      images: [],
    },
    {
      id: "2",
      userName: "Michael T.",
      rating: 4,
      comment: "Great quality for the price. Fast shipping too!",
      date: "2024-01-10",
      images: [],
    },
  ],
  relatedProducts: [
    {
      id: "2",
      slug: "handmade-ankara-bag",
      title: "Handmade Ankara Bag",
      price: 8000,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      ],
    },
    {
      id: "3",
      slug: "designer-sneakers",
      title: "Designer Sneakers",
      price: 45000,
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      ],
    },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(mockProduct);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCartStore();

  // Format WhatsApp URL with optional product context message
  const getWhatsAppUrl = (whatsapp: string, product?: any) => {
    if (!whatsapp) return null;
    const cleanNumber = whatsapp.replace(/[\s\+\-]/g, "");
    if (whatsapp.startsWith("http")) return whatsapp;

    let message = "";
    if (product) {
      message = `Hi! I'm interested in "${
        product.title
      }" (₦${product.price.toLocaleString()}). Can you tell me more about this product?`;
    }

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
    const username = instagram.replace(/^@/, "");
    if (instagram.startsWith("http")) return instagram;
    return `https://instagram.com/${username}`;
  };

  // Fetch product data based on slug
  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchProduct = async () => {
    //   try {
    //     const response = await fetch(
    //       `${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.slug}`
    //     );
    //     const data = await response.json();
    //     setProduct(data.data);
    //   } catch (error) {
    //     console.error("Error fetching product:", error);
    //   }
    // };
    // fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    addItem({
      _id: product.id,
      title: product.title,
      price: product.price,
      images: product.images,
      seller: product.shop.shopName,
      shopSlug: product.shop.shopSlug,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taja-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-taja-primary transition-colors mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                    {discountPercentage}% OFF
                  </div>
                )}
                <button className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors z-10">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-taja-primary"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Title and Shop */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <Link
                    href={`/shop/${product.shop.shopSlug}`}
                    className="text-lg text-gray-700 hover:text-taja-primary transition-colors"
                  >
                    {product.shop.shopName}
                  </Link>
                  {product.shop.isVerified && (
                    <div className="flex items-center gap-1 bg-taja-primary/10 text-taja-primary px-2 py-1 rounded text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.shop.averageRating}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ₦{product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      Save ₦
                      {(
                        product.compareAtPrice - product.price
                      ).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Condition & Location */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
                    {product.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Stock:</span>
                <span
                  className={`text-sm font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Message Seller Button - Always visible */}
              {product.shop.socialLinks?.whatsapp && (
                <div className="border-t pt-6 pb-4">
                  <a
                    href={
                      getWhatsAppUrl(
                        product.shop.socialLinks.whatsapp,
                        product
                      ) || "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white">
                      <Phone className="h-5 w-5" />
                      Message Seller on WhatsApp
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Ask questions, request more photos, or negotiate directly
                  </p>
                </div>
              )}

              {/* Quantity & Actions */}
              {product.stock > 0 && (
                <div className="space-y-4 border-t pt-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center gap-2 border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-taja-primary" />
                  <span>Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-taja-primary" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long Description & Reviews */}
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Details & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                  {product.longDescription}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Reviews ({product.reviews.length})
                </h2>
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.userName}
                          </p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shop Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <Link href={`/shop/${product.shop.shopSlug}`}>
                  <h3 className="text-lg font-semibold mb-4 hover:text-taja-primary transition-colors">
                    {product.shop.shopName}
                  </h3>
                </Link>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Rating</span>
                    <span className="font-medium">
                      {product.shop.averageRating}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Products</span>
                    <span className="font-medium">
                      {product.shop.totalProducts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Followers</span>
                    <span className="font-medium">
                      {product.shop.followers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Since</span>
                    <span className="font-medium">{product.shop.since}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(product.shop.socialLinks?.whatsapp ||
                  product.shop.socialLinks?.instagram) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-2">
                      Connect with seller:
                    </p>
                    <div className="flex flex-col gap-2">
                      {product.shop.socialLinks?.whatsapp && (
                        <a
                          href={
                            getWhatsAppUrl(
                              product.shop.socialLinks.whatsapp,
                              product
                            ) || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Phone className="h-4 w-4" />
                          Ask About This Product
                        </a>
                      )}
                      {product.shop.socialLinks?.instagram && (
                        <a
                          href={
                            getInstagramUrl(
                              product.shop.socialLinks.instagram
                            ) || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Instagram className="h-4 w-4" />
                          View Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => router.push(`/shop/${product.shop.shopSlug}`)}
                >
                  Visit Shop
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
