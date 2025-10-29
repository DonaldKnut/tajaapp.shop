"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface Order {
  id: string;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "escrowed";
  total: number;
  date: string;
  estimatedDelivery?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    seller: {
      name: string;
      shop: string;
    };
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    // TODO: Fetch orders from API
    // Mock data for now
    setOrders([
      {
        id: "1",
        orderNumber: "TJA-2024-001",
        status: "delivered",
        paymentStatus: "paid",
        total: 25000,
        date: "2024-01-15",
        estimatedDelivery: "2024-01-20",
        items: [
          {
            id: "1",
            name: "Vintage Denim Jacket",
            quantity: 1,
            price: 15000,
            image: "/placeholder-product.jpg",
            seller: {
              name: "Jane Smith",
              shop: "Vintage Finds",
            },
          },
          {
            id: "2",
            name: "Leather Handbag",
            quantity: 1,
            price: 10000,
            image: "/placeholder-product.jpg",
            seller: {
              name: "Jane Smith",
              shop: "Vintage Finds",
            },
          },
        ],
        shippingAddress: {
          street: "123 Main Street",
          city: "Lagos",
          state: "Lagos",
          postalCode: "100001",
        },
      },
      {
        id: "2",
        orderNumber: "TJA-2024-002",
        status: "shipped",
        paymentStatus: "paid",
        total: 18000,
        date: "2024-01-20",
        estimatedDelivery: "2024-01-25",
        items: [
          {
            id: "3",
            name: "Designer Sunglasses",
            quantity: 1,
            price: 18000,
            image: "/placeholder-product.jpg",
            seller: {
              name: "Mike Johnson",
              shop: "Fashion Forward",
            },
          },
        ],
        shippingAddress: {
          street: "456 Oak Avenue",
          city: "Abuja",
          state: "FCT",
          postalCode: "900001",
        },
      },
      {
        id: "3",
        orderNumber: "TJA-2024-003",
        status: "pending",
        paymentStatus: "pending",
        total: 12000,
        date: "2024-01-22",
        items: [
          {
            id: "4",
            name: "Wireless Headphones",
            quantity: 1,
            price: 12000,
            image: "/placeholder-product.jpg",
            seller: {
              name: "Tech Store",
              shop: "Electronics Hub",
            },
          },
        ],
        shippingAddress: {
          street: "789 Pine Street",
          city: "Port Harcourt",
          state: "Rivers",
          postalCode: "500001",
        },
      },
    ]);
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "escrowed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Highest Amount</option>
                <option>Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge
                      className={getPaymentStatusColor(order.paymentStatus)}
                    >
                      {order.paymentStatus}
                    </Badge>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} • ₦{item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sold by {item.seller.name} ({item.seller.shop})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₦{order.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="text-sm text-gray-900">
                        {order.shippingAddress.street},{" "}
                        {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-3">
                    {order.status === "delivered" && (
                      <Button size="sm" variant="outline">
                        Leave Review
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Link href={`/track/${order.orderNumber}`}>
                        <Button size="sm" variant="outline">
                          Track Package
                        </Button>
                      </Link>
                    )}
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button size="sm">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link href="/marketplace">
                  <Button>
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

