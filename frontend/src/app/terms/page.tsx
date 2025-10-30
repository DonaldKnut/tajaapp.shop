"use client";

import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Shield,
  Users,
  FileText,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-taja-primary" />
              <span className="text-2xl font-bold text-taja-dark">
                Taja.Shop
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/register"
                className="text-gray-700 hover:text-taja-primary transition-colors"
              >
                Back to Registration
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-taja-primary">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-taja-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using Taja.Shop. By using
            our platform, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">1</span>
                </div>
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By accessing and using Taja.Shop ("the Platform"), you accept
                and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of our website
                located at taja.shop (the "Service") operated by Taja.Shop
                ("us", "we", or "our").
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">2</span>
                </div>
                User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                To access certain features of the Platform, you must register
                for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>
                  Maintain and update your account information to keep it
                  accurate
                </li>
                <li>Maintain the security of your password and account</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
              <p className="text-gray-700">
                You must be at least 18 years old to create an account and use
                our services.
              </p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">3</span>
                </div>
                Buyer and Seller Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  For Buyers:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>
                    Make payments promptly and through approved payment methods
                  </li>
                  <li>Provide accurate shipping information</li>
                  <li>Communicate respectfully with sellers</li>
                  <li>Leave honest and fair reviews</li>
                  <li>Report any issues or disputes promptly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  For Sellers:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Provide accurate product descriptions and images</li>
                  <li>Ship items within the specified timeframe</li>
                  <li>Maintain adequate inventory levels</li>
                  <li>Respond to customer inquiries promptly</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Provide authentic products and services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">4</span>
                </div>
                Payment and Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Taja.Shop uses secure payment processors including Flutterwave
                and Paystack to handle transactions. We implement an escrow
                system to protect both buyers and sellers.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  All payments are processed securely through our payment
                  partners
                </li>
                <li>Funds are held in escrow until order completion</li>
                <li>Refunds are processed according to our refund policy</li>
                <li>Transaction fees may apply as disclosed during checkout</li>
                <li>
                  We reserve the right to hold funds for verification purposes
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">5</span>
                </div>
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You agree not to use the Platform for any unlawful purpose or
                any purpose prohibited under this clause. You may not use the
                Platform in any manner that could damage, disable, overburden,
                or impair any server, or the network(s) connected to any server.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Prohibited Content:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>Counterfeit or fake products</li>
                    <li>Illegal or restricted items</li>
                    <li>Adult content or services</li>
                    <li>Hate speech or discriminatory content</li>
                    <li>Copyrighted material without permission</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Prohibited Behavior:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>Fraudulent activities</li>
                    <li>Spam or unsolicited communications</li>
                    <li>Manipulation of reviews or ratings</li>
                    <li>Circumventing platform fees</li>
                    <li>Creating multiple accounts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">6</span>
                </div>
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The Platform and its original content, features, and
                functionality are and will remain the exclusive property of
                Taja.Shop and its licensors. The Platform is protected by
                copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700">
                You retain ownership of content you upload to the Platform, but
                grant us a license to use, display, and distribute such content
                in connection with the Platform.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">7</span>
                </div>
                Disclaimers and Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The Platform is provided on an "AS IS" and "AS AVAILABLE" basis.
                Taja.Shop expressly disclaims all warranties of any kind,
                whether express or implied.
              </p>
              <p className="text-gray-700">
                In no event shall Taja.Shop, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">8</span>
                </div>
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may terminate or suspend your account and bar access to the
                Platform immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation.
              </p>
              <p className="text-gray-700">
                Upon termination, your right to use the Platform will cease
                immediately. If you wish to terminate your account, you may
                simply discontinue using the Platform.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">9</span>
                </div>
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will provide at least 30 days notice prior to any new terms
                taking effect.
              </p>
              <p className="text-gray-700">
                By continuing to access or use our Platform after those
                revisions become effective, you agree to be bound by the revised
                terms.
              </p>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">
                    10
                  </span>
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@taja.shop
                  <br />
                  <strong>Phone:</strong> +234 (0) 800 Taja Shop
                  <br />
                  <strong>Address:</strong> Lagos, Nigeria
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-taja-primary to-purple-600 hover:from-taja-primary/90 hover:to-purple-600/90">
                I Agree - Continue Registration
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline">Read Privacy Policy</Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            By continuing, you acknowledge that you have read and agree to these
            Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}




