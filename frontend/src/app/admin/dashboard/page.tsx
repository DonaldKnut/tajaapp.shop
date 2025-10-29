"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// Mock admin data
const adminData = {
  stats: {
    totalUsers: 1247,
    totalShops: 342,
    totalProducts: 2156,
    totalRevenue: 15640000,
    pendingVerifications: 23,
    activeDisputes: 5,
  },
  recentUsers: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "seller",
      isVerified: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "buyer",
      isVerified: true,
      createdAt: new Date(),
    },
  ],
  pendingVerifications: [
    {
      id: "1",
      user: {
        name: "Amina Hassan",
        email: "amina@example.com",
        shop: "Amina Thrift",
      },
      submittedAt: new Date(),
      documents: ["NIN", "Selfie"],
    },
    {
      id: "2",
      user: {
        name: "Kemi Adebayo",
        email: "kemi@example.com",
        shop: "Kemi Crafts",
      },
      submittedAt: new Date(),
      documents: ["NIN", "Selfie"],
    },
  ],
  recentTransactions: [
    {
      id: "1",
      type: "payment",
      amount: 25000,
      user: "John Doe",
      status: "successful",
      createdAt: new Date(),
    },
    {
      id: "2",
      type: "payout",
      amount: 18500,
      user: "Amina Hassan",
      status: "successful",
      createdAt: new Date(),
    },
  ],
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: number;
  color?: string;
}) => {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
    red: "text-red-500 bg-red-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-full ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />+{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const handleVerification = async (
    userId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        action === "approve"
          ? `/api/users/${userId}/approve-verification`
          : `/api/users/${userId}/reject-verification`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Verification action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8 text-taja-primary" />
                <span className="text-2xl font-bold text-taja-dark">
                  Taja.Shop
                </span>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="text-taja-primary font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-600 hover:text-taja-primary"
                >
                  Users
                </Link>
                <Link
                  href="/admin/shops"
                  className="text-gray-600 hover:text-taja-primary"
                >
                  Shops
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-gray-600 hover:text-taja-primary"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/transactions"
                  className="text-gray-600 hover:text-taja-primary"
                >
                  Transactions
                </Link>
                <Link
                  href="/admin/disputes"
                  className="text-gray-600 hover:text-taja-primary"
                >
                  Disputes
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your Taja.Shop marketplace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={adminData.stats.totalUsers.toLocaleString()}
            icon={Users}
            change={15}
            color="blue"
          />
          <StatCard
            title="Active Shops"
            value={adminData.stats.totalShops}
            icon={Store}
            change={8}
            color="green"
          />
          <StatCard
            title="Total Products"
            value={adminData.stats.totalProducts.toLocaleString()}
            icon={Package}
            change={22}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`₦${(adminData.stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            change={18}
            color="green"
          />
          <StatCard
            title="Pending Verifications"
            value={adminData.stats.pendingVerifications}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Active Disputes"
            value={adminData.stats.activeDisputes}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Verifications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Verifications
                  </div>
                  <Link href="/admin/verifications">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.pendingVerifications.map((verification) => (
                    <div
                      key={verification.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {verification.user.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {verification.submittedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {verification.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Shop: {verification.user.shop}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {verification.documents.map((doc) => (
                            <span
                              key={doc}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleVerification(verification.id, "approve")
                          }
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleVerification(
                              verification.id,
                              "reject",
                              "Documents not clear"
                            )
                          }
                          disabled={loading}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {user.name}
                          </h4>
                          {user.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.role === "seller"
                              ? "bg-taja-primary/10 text-taja-primary"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {transaction.type === "payment"
                            ? "Payment"
                            : "Payout"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {transaction.user}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₦{transaction.amount.toLocaleString()}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === "successful"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users/new">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </Link>
                <Link href="/admin/categories">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Platform Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



