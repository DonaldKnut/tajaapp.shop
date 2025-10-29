"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  Eye,
  Star,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  viewsChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
  items: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  revenue: number;
  views: number;
  rating: number;
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    viewsChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch seller dashboard data from API
    // Mock data for now
    setStats({
      totalRevenue: 1250000,
      totalOrders: 45,
      totalProducts: 12,
      totalViews: 2840,
      revenueChange: 12.5,
      ordersChange: 8.2,
      productsChange: 0,
      viewsChange: 15.3,
    });

    setRecentOrders([
      {
        id: "1",
        orderNumber: "TJA-2024-001",
        customer: "John Doe",
        total: 25000,
        status: "delivered",
        date: "2024-01-15",
        items: 2,
      },
      {
        id: "2",
        orderNumber: "TJA-2024-002",
        customer: "Jane Smith",
        total: 18000,
        status: "shipped",
        date: "2024-01-20",
        items: 1,
      },
      {
        id: "3",
        orderNumber: "TJA-2024-003",
        customer: "Mike Johnson",
        total: 32000,
        status: "processing",
        date: "2024-01-22",
        items: 3,
      },
    ]);

    setTopProducts([
      {
        id: "1",
        name: "Vintage Denim Jacket",
        image: "/placeholder-product.jpg",
        price: 15000,
        sales: 8,
        revenue: 120000,
        views: 245,
        rating: 4.8,
      },
      {
        id: "2",
        name: "Leather Handbag",
        image: "/placeholder-product.jpg",
        price: 12000,
        sales: 6,
        revenue: 72000,
        views: 189,
        rating: 4.6,
      },
      {
        id: "3",
        name: "Designer Sunglasses",
        image: "/placeholder-product.jpg",
        price: 18000,
        sales: 4,
        revenue: 72000,
        views: 156,
        rating: 4.9,
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's how your shop is performing.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/seller/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ₦{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      {stats.revenueChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalOrders}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      {stats.ordersChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalProducts}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                      <span className="sr-only">No change</span>
                      {stats.productsChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Views
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      {stats.viewsChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Orders
              </h3>
              <Link
                href="/seller/orders"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer} • {order.items} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      ₦{order.total.toLocaleString()}
                    </span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Products
              </h3>
              <Link
                href="/seller/products"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500">
                        ({product.rating})
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {product.sales} sales • {product.views} views
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₦{product.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/seller/products/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-emerald-50 text-emerald-700 ring-4 ring-white">
                  <Plus className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Add Product
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  List a new product for sale
                </p>
              </div>
            </Link>

            <Link
              href="/seller/products"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <Package className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Manage Products
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Edit and organize your products
                </p>
              </div>
            </Link>

            <Link
              href="/seller/orders"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <ShoppingCart className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  View Orders
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Track and manage orders
                </p>
              </div>
            </Link>

            <Link
              href="/seller/analytics"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View detailed performance metrics
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
