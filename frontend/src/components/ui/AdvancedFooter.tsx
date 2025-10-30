"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  ArrowRight,
  CheckCircle,
  Shield,
  Truck,
  CreditCard,
  Headphones,
  MessageCircle,
  HelpCircle,
  Star,
  Award,
  Users,
  Globe,
  Download,
  Bell,
  Settings,
  User,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock,
  Zap,
  Sparkles,
  Crown,
  Diamond,
  Gem,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { useState } from "react";

const footerSections = [
  {
    title: "For Sellers",
    links: [
      { name: "Start Selling", href: "/register" },
      { name: "Seller Dashboard", href: "/seller" },
    ],
  },
  {
    title: "For Buyers",
    links: [
      { name: "How to Buy", href: "/how-to-buy" },
      { name: "Buyer Protection", href: "/buyer-protection" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/tajashop",
    icon: Facebook,
    color: "text-blue-600",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/tajashop",
    icon: Twitter,
    color: "text-blue-400",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/tajashop",
    icon: Instagram,
    color: "text-pink-500",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/tajashop",
    icon: Youtube,
    color: "text-red-600",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/tajashop",
    icon: Linkedin,
    color: "text-blue-700",
  },
  {
    name: "GitHub",
    href: "https://github.com/tajashop",
    icon: Github,
    color: "text-gray-600",
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-level security",
  },
  { icon: Truck, title: "Fast Delivery", description: "Nationwide shipping" },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here to help",
  },
  { icon: Star, title: "Quality Guarantee", description: "100% satisfaction" },
];

const stats = [
  { number: "50K+", label: "Active Sellers" },
  { number: "500K+", label: "Products Listed" },
  { number: "1M+", label: "Happy Customers" },
  { number: "99.9%", label: "Uptime" },
];

export function AdvancedFooter() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [email, setEmail] = useState("");

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
  };

  return (
    <footer className="bg-emerald-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-emerald-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">
              Stay Updated with Taja.Shop
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get the latest updates on new features, seller tips, and exclusive
              deals delivered to your inbox.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto flex gap-4"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-emerald-900/30 border-emerald-300/30 text-white placeholder-white/70 focus:bg-emerald-900/40"
                required
              />
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-2 mb-6">
              <ShoppingBag className="h-8 w-8 text-taja-primary" />
              <span className="text-2xl font-bold">Taja.Shop</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              Nigeria's most trusted marketplace for thrift fashion, vintage
              items, and handmade crafts. From WhatsApp chaos to your own
              verified digital shop.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <feature.icon className="h-5 w-5 text-taja-primary" />
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-gray-400">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`p-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/60 transition-colors ${social.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <button
                    className="flex items-center justify-between w-full text-left font-semibold text-lg mb-4 lg:hidden"
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    {section.title}
                    {expandedSections.has(sectionIndex) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <h3 className="hidden lg:block font-semibold text-lg mb-4">
                    {section.title}
                  </h3>
                  <div
                    className={`space-y-2 ${
                      expandedSections.has(sectionIndex)
                        ? "block"
                        : "hidden lg:block"
                    }`}
                  >
                    {section.links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="group block text-gray-100 hover:text-white transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className="transition-transform group-hover:translate-x-0.5">
                            {link.name}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <Separator className="my-12 bg-gray-700" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-taja-primary mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-emerald-900/40 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-lg mb-4">Get in Touch</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-taja-primary" />
              <div>
                <div className="font-medium">Email Support</div>
                <div className="text-gray-400">support@taja.shop</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-taja-primary" />
              <div>
                <div className="font-medium">Phone Support</div>
                <div className="text-gray-400">+234 (0) 800 Taja Shop</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-taja-primary" />
              <div>
                <div className="font-medium">Office Location</div>
                <div className="text-gray-400">Lagos, Nigeria</div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Apps */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="font-semibold text-lg mb-2">
                Download Our Mobile App
              </h4>
              <p className="text-gray-300">
                Shop and sell on the go with our mobile app
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-transparent border-gray-400 text-white hover:bg-white hover:text-gray-900"
              >
                <Download className="h-4 w-4 mr-2" />
                iOS App
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-gray-400 text-white hover:bg-white hover:text-gray-900"
              >
                <Download className="h-4 w-4 mr-2" />
                Android App
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-green-400" />
            <span className="text-sm">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <span className="text-sm">Verified Sellers</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-blue-400" />
            <span className="text-sm">Fast Delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-purple-400" />
            <span className="text-sm">Secure Payments</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-700">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Taja.Shop. All rights reserved. Built with ❤️ for Nigerian
            entrepreneurs.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link
              href="/sitemap"
              className="hover:text-white transition-colors"
            >
              Sitemap
            </Link>
            <Link href="/rss" className="hover:text-white transition-colors">
              RSS Feed
            </Link>
            <Link href="/api" className="hover:text-white transition-colors">
              API
            </Link>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>English (NG)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
