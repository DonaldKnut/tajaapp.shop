"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: "order" | "wishlist" | "review";
  message: string;
  date: string;
  status?: string;
}

export default function DashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    // TODO: Fetch user dashboard data from API
    // Mock data for now
    setRecentOrders([
      {
        id: "1",
        orderNumber: "TJA-2024-001",
        status: "delivered",
        total: 25000,
        date: "2024-01-15",
        items: [
          {
            name: "Vintage Denim Jacket",
            quantity: 1,
            price: 15000,
            image: "/placeholder-product.jpg",
          },
          {
            name: "Leather Handbag",
            quantity: 1,
            price: 10000,
            image: "/placeholder-product.jpg",
          },
        ],
      },
      {
        id: "2",
        orderNumber: "TJA-2024-002",
        status: "shipped",
        total: 18000,
        date: "2024-01-20",
        items: [
          {
            name: "Designer Sunglasses",
            quantity: 1,
            price: 18000,
            image: "/placeholder-product.jpg",
          },
        ],
      },
    ]);

    setRecentActivity([
      {
        id: "1",
        type: "order",
        message: "Order TJA-2024-002 has been shipped",
        date: "2024-01-20",
        status: "shipped",
      },
      {
        id: "2",
        type: "wishlist",
        message: "Added 'Vintage Watch' to your wishlist",
        date: "2024-01-19",
      },
      {
        id: "3",
        type: "review",
        message: "Your review for 'Denim Jacket' was helpful to 5 people",
        date: "2024-01-18",
      },
    ]);

    setStats({
      totalOrders: 12,
      pendingOrders: 2,
      wishlistItems: 8,
      totalSpent: 156000,
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Wishlist Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.wishlistItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Spent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₦{stats.totalSpent.toLocaleString()}
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
                href="/dashboard/orders"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item(s) • ₦
                        {order.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === "order" && (
                      <Package className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.type === "wishlist" && (
                      <Heart className="h-5 w-5 text-red-500" />
                    )}
                    {activity.type === "review" && (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
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
              href="/marketplace"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-emerald-50 text-emerald-700 ring-4 ring-white">
                  <ShoppingBag className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Browse Products
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Discover new items in our marketplace
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/dashboard/wishlist"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-700 ring-4 ring-white">
                  <Heart className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  View Wishlist
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check your saved items
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/dashboard/orders"
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
                  Track Orders
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Monitor your order status
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/dashboard/profile"
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
                  Update Profile
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your account settings
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

