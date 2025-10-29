"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit,
  Trash2,
  Eye,
  Tag,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock" | "hidden";
  category: string;
  updatedAt: string;
  image: string;
  views: number;
  sales: number;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [filtered, setFiltered] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: Fetch seller products from API
    setProducts([
      {
        id: "1",
        title: "Vintage Denim Jacket",
        price: 15000,
        stock: 12,
        status: "active",
        category: "fashion",
        updatedAt: "2024-01-20",
        image: "/placeholder-product.jpg",
        views: 245,
        sales: 8,
      },
      {
        id: "2",
        title: "Leather Handbag",
        price: 12000,
        stock: 0,
        status: "out_of_stock",
        category: "fashion",
        updatedAt: "2024-01-18",
        image: "/placeholder-product.jpg",
        views: 189,
        sales: 6,
      },
      {
        id: "3",
        title: "Wireless Headphones",
        price: 25000,
        stock: 5,
        status: "draft",
        category: "electronics",
        updatedAt: "2024-01-22",
        image: "/placeholder-product.jpg",
        views: 156,
        sales: 2,
      },
    ]);
  }, []);

  useEffect(() => {
    let list = products;
    if (search) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== "all") list = list.filter((p) => p.status === status);
    if (category !== "all") list = list.filter((p) => p.category === category);
    setFiltered(list);
  }, [products, search, status, category]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleSelectAll = () => {
    if (isAllSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const bulkSetStatus = (newStatus: SellerProduct["status"]) => {
    // TODO: Call bulk API update
    setProducts((prev) =>
      prev.map((p) => (selected.has(p.id) ? { ...p, status: newStatus } : p))
    );
    setSelected(new Set());
  };

  const bulkDelete = () => {
    // TODO: Call bulk delete API
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  };

  const statusBadge = (s: SellerProduct["status"]) => {
    switch (s) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case "hidden":
        return <Badge className="bg-yellow-100 text-yellow-800">Hidden</Badge>;
      default:
        return <Badge>—</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/seller/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Garden</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>

            {/* Bulk actions */}
            <div className="flex items-center space-x-2">
              <div className="relative inline-block text-left">
                <Button variant="outline" disabled={selected.size === 0}>
                  <Tag className="mr-2 h-4 w-4" /> Bulk Update
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                {/* In a real app, use a dropdown menu component */}
                {selected.size > 0 && (
                  <div className="mt-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSetStatus("active")}
                    >
                      Set Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSetStatus("draft")}
                    >
                      Set Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSetStatus("hidden")}
                    >
                      Set Hidden
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={bulkDelete}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category}
                        </div>
                        <div className="text-xs text-gray-400">
                          Updated{" "}
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="font-medium">{product.views}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sales</p>
                        <p className="font-medium">{product.sales}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="inline-flex items-center space-x-2">
                      <Link href={`/product/${product.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

