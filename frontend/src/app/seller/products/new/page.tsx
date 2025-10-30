"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Upload,
  X,
  Camera,
  Tag,
  Package,
  Truck,
  ArrowLeft,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import toast from "react-hot-toast";

const categories = [
  "Fashion & Clothing",
  "Electronics",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Accessories",
  "Books & Media",
  "Art & Crafts",
  "Jewelry",
  "Shoes & Bags",
];

const conditions = [
  { value: "new", label: "New", desc: "Brand new, unused" },
  { value: "like-new", label: "Like New", desc: "Minimal signs of wear" },
  { value: "good", label: "Good", desc: "Some wear but fully functional" },
  { value: "fair", label: "Fair", desc: "Noticeable wear but works well" },
  { value: "poor", label: "Poor", desc: "Significant wear, may have defects" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const colors = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Gray",
  "Brown",
];

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    condition: "good",
    price: "",
    compareAtPrice: "",
    currency: "NGN",
    images: [] as string[],
    specifications: {
      brand: "",
      size: "",
      color: "",
      material: "",
      gender: "",
    },
    inventory: {
      quantity: 1,
      sku: "",
      trackQuantity: true,
    },
    shipping: {
      weight: "",
      freeShipping: false,
      shippingCost: "",
      processingTime: "1-2-days",
    },
    seo: {
      tags: [] as string[],
      metaTitle: "",
      metaDescription: "",
    },
    status: "active" as "active" | "draft",
  });
  const [tagInput, setTagInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [parent]: { ...(prev as any)[parent], [child]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      // Simulate image upload - replace with actual Cloudinary integration
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 8), // Max 8 images
      }));

      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.seo.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          tags: [...prev.seo.tags, tagInput.trim()],
        },
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        tags: prev.seo.tags.filter((t) => t !== tag),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Get user's shop - in a real app, this would be fetched from user profile
      const shopResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shops`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const shopData = await shopResponse.json();
      const userShop = shopData.data.shops[0]; // Assuming user has at least one shop

      const productData = {
        ...formData,
        shop: userShop._id,
        status: isDraft ? "draft" : formData.status,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        shipping: {
          ...formData.shipping,
          weight: formData.shipping.weight
            ? parseFloat(formData.shipping.weight)
            : undefined,
          shippingCost: formData.shipping.shippingCost
            ? parseFloat(formData.shipping.shippingCost)
            : 0,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Product ${isDraft ? "saved as draft" : "published"} successfully!`
        );
        router.push("/seller/products");
      } else {
        toast.error(data.error || "Failed to create product");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/seller/dashboard"
                className="flex items-center space-x-2"
              >
                <ShoppingBag className="h-8 w-8 text-taja-primary" />
                <span className="text-2xl font-bold text-taja-dark">
                  Taja.Shop
                </span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/seller/products"
                className="flex items-center text-gray-600 hover:text-taja-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Products
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                Save Draft
              </Button>
              <Button onClick={(e) => handleSubmit(e)} disabled={loading}>
                {loading ? "Publishing..." : "Publish Product"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    placeholder="e.g., Vintage Denim Jacket - Size M"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="condition"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Condition *
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      required
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label} - {cond.desc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-taja-primary transition-colors"
                    >
                      <Upload className="h-5 w-5 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">
                        {uploadingImages ? "Uploading..." : "Add Image"}
                      </span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleImageUpload(e.target.files)
                  }
                  className="hidden"
                />

                <p className="text-sm text-gray-500">
                  Upload up to 8 images. First image will be the main product
                  photo.
                </p>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="brand"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Brand
                    </label>
                    <input
                      id="brand"
                      name="specifications.brand"
                      type="text"
                      value={formData.specifications.brand}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="material"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Material
                    </label>
                    <input
                      id="material"
                      name="specifications.material"
                      type="text"
                      value={formData.specifications.material}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                      placeholder="e.g., Cotton, Leather, Denim"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="size"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Size
                    </label>
                    <select
                      id="size"
                      name="specifications.size"
                      value={formData.specifications.size}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      <option value="">Select size</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="color"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Color
                    </label>
                    <select
                      id="color"
                      name="specifications.color"
                      value={formData.specifications.color}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      <option value="">Select color</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="specifications.gender"
                      value={formData.specifications.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price (₦) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="compareAtPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Compare at Price (₦)
                  </label>
                  <input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    placeholder="Original price if on sale"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inventory.trackQuantity"
                      checked={formData.inventory.trackQuantity}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-taja-primary focus:ring-taja-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Track quantity
                    </span>
                  </label>
                </div>

                {formData.inventory.trackQuantity && (
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Quantity Available
                    </label>
                    <input
                      id="quantity"
                      name="inventory.quantity"
                      type="number"
                      min="0"
                      value={formData.inventory.quantity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="shipping.freeShipping"
                      checked={formData.shipping.freeShipping}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-taja-primary focus:ring-taja-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Free shipping</span>
                  </label>
                </div>

                {!formData.shipping.freeShipping && (
                  <div>
                    <label
                      htmlFor="shippingCost"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Shipping Cost (₦)
                    </label>
                    <input
                      id="shippingCost"
                      name="shipping.shippingCost"
                      type="number"
                      min="0"
                      value={formData.shipping.shippingCost}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="processingTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Processing Time
                  </label>
                  <select
                    id="processingTime"
                    name="shipping.processingTime"
                    value={formData.shipping.processingTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                  >
                    <option value="1-2-days">1-2 days</option>
                    <option value="3-5-days">3-5 days</option>
                    <option value="1-week">1 week</option>
                    <option value="2-weeks">2 weeks</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* SEO & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      id="tagInput"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                      placeholder="Enter tag and press Enter"
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-taja-primary/10 text-taja-primary text-xs rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}




