"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Upload,
  ArrowRight,
  Store,
  Instagram,
  MessageSquare,
  Twitter,
  Facebook,
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

export default function SellerSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    shopSlug: "",
    description: "",
    categories: [] as string[],
    businessInfo: {
      businessType: "individual" as "individual" | "business",
      businessName: "",
      businessAddress: "",
    },
    socialLinks: {
      instagram: "",
      whatsapp: "",
      twitter: "",
      facebook: "",
    },
    settings: {
      responseTime: "within-day",
      shippingMethods: ["delivery"] as string[],
      returnPolicy: "No returns accepted",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleShippingMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        shippingMethods: prev.settings.shippingMethods.includes(method)
          ? prev.settings.shippingMethods.filter((m) => m !== method)
          : [...prev.settings.shippingMethods, method],
      },
    }));
  };

  const generateSlug = (shopName: string) => {
    return shopName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
  };

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shopName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      shopName,
      shopSlug: generateSlug(shopName),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shops`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Shop created successfully!");
        router.push("/seller/dashboard");
      } else {
        toast.error(data.error || "Failed to create shop");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (
      step === 1 &&
      (!formData.shopName || formData.categories.length === 0)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-taja-light to-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-taja-primary" />
              <span className="text-2xl font-bold text-taja-dark">
                Taja.Shop
              </span>
            </Link>
            <div className="text-sm text-gray-600">
              Step {step} of 3: Set up your shop
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Setup Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-taja-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6 text-taja-primary" />
              {step === 1 && "Basic Shop Information"}
              {step === 2 && "Business Details"}
              {step === 3 && "Shop Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="shopName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Shop Name *
                    </label>
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={handleShopNameChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                      placeholder="e.g., Amina's Thrift Store"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shopSlug"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Shop URL
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                        taja.shop/
                      </span>
                      <input
                        id="shopSlug"
                        name="shopSlug"
                        type="text"
                        value={formData.shopSlug}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                        placeholder="shop-url"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your unique shop URL. Only lowercase letters,
                      numbers, and underscores allowed.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Shop Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                      placeholder="Tell customers about your shop and what you sell..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Categories * (Select at least one)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="mr-2 h-4 w-4 text-taja-primary focus:ring-taja-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Business Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`p-4 border-2 rounded-lg cursor-pointer ${
                          formData.businessInfo.businessType === "individual"
                            ? "border-taja-primary bg-taja-primary/5"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessInfo.businessType"
                          value="individual"
                          checked={
                            formData.businessInfo.businessType === "individual"
                          }
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-medium">Individual</div>
                          <div className="text-sm text-gray-500">
                            Personal seller
                          </div>
                        </div>
                      </label>
                      <label
                        className={`p-4 border-2 rounded-lg cursor-pointer ${
                          formData.businessInfo.businessType === "business"
                            ? "border-taja-primary bg-taja-primary/5"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessInfo.businessType"
                          value="business"
                          checked={
                            formData.businessInfo.businessType === "business"
                          }
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-medium">Business</div>
                          <div className="text-sm text-gray-500">
                            Registered business
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.businessInfo.businessType === "business" && (
                    <>
                      <div>
                        <label
                          htmlFor="businessName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Business Name
                        </label>
                        <input
                          id="businessName"
                          name="businessInfo.businessName"
                          type="text"
                          value={formData.businessInfo.businessName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                          placeholder="Your registered business name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="businessAddress"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Business Address
                        </label>
                        <textarea
                          id="businessAddress"
                          name="businessInfo.businessAddress"
                          rows={3}
                          value={formData.businessInfo.businessAddress}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                          placeholder="Your business address"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Social Media & Contact Links
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <strong>✨ Stay Connected:</strong> Add your Instagram and
                      WhatsApp to help customers reach you directly. This
                      reduces the chaos of managing thousands of images and
                      messages on WhatsApp by giving you a professional shop
                      page on Taja.Shop!
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                          Instagram Username
                        </label>
                        <input
                          name="socialLinks.instagram"
                          type="text"
                          value={formData.socialLinks.instagram}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                          placeholder="your_instagram_handle (without @)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Customers can click to visit your Instagram profile
                          and see more of your products
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                          WhatsApp Business Number
                        </label>
                        <input
                          name="socialLinks.whatsapp"
                          type="tel"
                          value={formData.socialLinks.whatsapp}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                          placeholder="2348123456789 (country code + number, no + or spaces)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Important:</strong> This creates a direct
                          WhatsApp chat link. Customers can message you without
                          saving your number!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="responseTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Response Time
                    </label>
                    <select
                      id="responseTime"
                      name="settings.responseTime"
                      value={formData.settings.responseTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                    >
                      <option value="within-hour">Within 1 hour</option>
                      <option value="within-day">Within 24 hours</option>
                      <option value="1-2-days">1-2 days</option>
                      <option value="3-5-days">3-5 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Shipping Methods
                    </label>
                    <div className="space-y-2">
                      {["pickup", "delivery", "shipping"].map((method) => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.settings.shippingMethods.includes(
                              method
                            )}
                            onChange={() => handleShippingMethodChange(method)}
                            className="mr-2 h-4 w-4 text-taja-primary focus:ring-taja-primary border-gray-300 rounded"
                          />
                          <span className="text-sm capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="returnPolicy"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Return Policy
                    </label>
                    <textarea
                      id="returnPolicy"
                      name="settings.returnPolicy"
                      rows={4}
                      value={formData.settings.returnPolicy}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                      placeholder="Describe your return policy..."
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="ml-auto">
                    {loading ? "Creating Shop..." : "Create Shop"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
