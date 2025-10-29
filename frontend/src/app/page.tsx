"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Shield,
  Truck,
  Users,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { BrandShowcase } from "@/components/ui/BrandShowcase";
import { AdvancedFooter } from "@/components/ui/AdvancedFooter";
import { useState } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-taja-primary" />
              <span className="text-2xl font-bold text-taja-dark">
                Taja.Shop
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/marketplace"
                className="text-gray-700 hover:text-taja-primary transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-taja-primary transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-taja-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-taja-primary text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors btn-hover"
              >
                Start Selling
              </Link>
            </div>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-taja-primary hover:bg-gray-100"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-semibold text-taja-dark">Menu</span>
              <button
                className="p-2 rounded-md text-gray-700 hover:text-taja-primary hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/marketplace"
                className="text-gray-800 hover:text-taja-primary"
                onClick={() => setMobileOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-800 hover:text-taja-primary"
                onClick={() => setMobileOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="/login"
                className="text-gray-800 hover:text-taja-primary"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-taja-primary text-white px-4 py-2 rounded-lg hover:bg-emerald-600 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Start Selling
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-taja-dark mb-6 animate-fade-in">
              From WhatsApp chaos to <br />
              <span className="text-taja-primary">your own shop</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nigeria's trusted marketplace for thrift fashion, vintage items,
              and handmade crafts. Give every seller their own verified digital
              shop with secure payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="bg-taja-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-all btn-hover flex items-center gap-2"
              >
                Create Your Shop
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className="border-2 border-taja-primary text-taja-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-taja-primary hover:text-white transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      <BrandShowcase />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-taja-primary to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start your digital shop?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of Nigerian entrepreneurs building their brands on
            Taja.Shop
          </p>
          <Link
            href="/register"
            className="bg-white text-taja-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all btn-hover inline-flex items-center gap-2"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Advanced Footer */}
      <AdvancedFooter />
    </div>
  );
}
