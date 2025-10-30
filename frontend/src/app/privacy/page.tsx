"use client";

import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function PrivacyPage() {
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
          <span className="text-gray-900">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-taja-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Privacy Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">1</span>
                </div>
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-taja-primary" />
                  Personal Information
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>
                    Payment information (processed securely by our payment
                    partners)
                  </li>
                  <li>Profile information and preferences</li>
                  <li>Government-issued ID for seller verification</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-taja-primary" />
                  Usage Information
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Search queries and product interactions</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">2</span>
                </div>
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use the information we collect to provide, maintain, and
                improve our services. Here's how:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Service Delivery:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>Process orders and payments</li>
                    <li>Facilitate communication between buyers and sellers</li>
                    <li>Provide customer support</li>
                    <li>Send order updates and notifications</li>
                    <li>Verify seller identities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Platform Improvement:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>Analyze usage patterns</li>
                    <li>Improve user experience</li>
                    <li>Develop new features</li>
                    <li>Prevent fraud and abuse</li>
                    <li>Personalize recommendations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">3</span>
                </div>
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    With Your Consent
                  </h4>
                  <p className="text-blue-800 text-sm">
                    We may share information when you explicitly consent to such
                    sharing.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Service Providers
                  </h4>
                  <p className="text-green-800 text-sm">
                    We share information with trusted third-party service
                    providers who assist us in operating our platform, such as
                    payment processors, delivery services, and customer support
                    tools.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Legal Requirements
                  </h4>
                  <p className="text-yellow-800 text-sm">
                    We may disclose information if required by law, court order,
                    or to protect our rights and the safety of our users.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Business Transfers
                  </h4>
                  <p className="text-purple-800 text-sm">
                    In the event of a merger, acquisition, or sale of assets,
                    user information may be transferred as part of the
                    transaction.
                  </p>
                </div>
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
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement industry-standard security measures to protect your
                personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-taja-primary" />
                    Technical Safeguards
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted data storage</li>
                    <li>Regular security audits</li>
                    <li>Secure payment processing</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-taja-primary" />
                    Administrative Safeguards
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li>Employee training on data protection</li>
                    <li>Limited access to personal data</li>
                    <li>Regular policy reviews</li>
                    <li>Incident response procedures</li>
                    <li>Vendor security assessments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">5</span>
                </div>
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You have certain rights regarding your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Access</h4>
                      <p className="text-gray-700 text-sm">
                        View and download your personal data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Correction
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Update or correct inaccurate information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Portability
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Export your data in a common format
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Deletion</h4>
                      <p className="text-gray-700 text-sm">
                        Request deletion of your account and data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Restriction
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Limit how we process your data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-taja-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Objection</h4>
                      <p className="text-gray-700 text-sm">
                        Opt out of certain data processing
                      </p>
                    </div>
                  </div>
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
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to enhance your
                experience on our platform:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Essential Cookies
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Required for basic platform functionality, such as
                    maintaining your login session and shopping cart.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Analytics Cookies
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Help us understand how users interact with our platform to
                    improve performance and user experience.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Marketing Cookies
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Used to deliver relevant advertisements and measure the
                    effectiveness of our marketing campaigns.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                You can control cookie preferences through your browser
                settings, though disabling certain cookies may affect platform
                functionality.
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
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Account Information:</strong> Retained while your
                  account is active and for a reasonable period after closure
                </li>
                <li>
                  <strong>Transaction Records:</strong> Kept for legal and
                  accounting purposes (typically 7 years)
                </li>
                <li>
                  <strong>Communication Records:</strong> Retained for customer
                  support and dispute resolution
                </li>
                <li>
                  <strong>Marketing Data:</strong> Kept until you opt out or
                  request deletion
                </li>
                <li>
                  <strong>Analytics Data:</strong> Aggregated and anonymized
                  data may be retained indefinitely
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">8</span>
                </div>
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your information may be transferred to and processed in
                countries other than your country of residence. We ensure
                appropriate safeguards are in place:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Standard contractual clauses approved by relevant data
                  protection authorities
                </li>
                <li>Adequacy decisions by competent authorities</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Binding corporate rules for intra-group transfers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">9</span>
                </div>
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our services are not intended for children under 18 years of
                age. We do not knowingly collect personal information from
                children under 18.
              </p>
              <p className="text-gray-700">
                If we become aware that we have collected personal information
                from a child under 18, we will take steps to delete such
                information from our servers immediately.
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
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice on our platform</li>
                <li>
                  Updating the "Last updated" date at the top of this policy
                </li>
              </ul>
              <p className="text-gray-700">
                Your continued use of our services after any changes constitutes
                acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-taja-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-taja-primary font-bold text-sm">
                    11
                  </span>
                </div>
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Privacy Officer:</strong>
                  <br />
                  <strong>Email:</strong> privacy@taja.shop
                  <br />
                  <strong>Phone:</strong> +234 (0) 800 Taja Shop
                  <br />
                  <strong>Address:</strong> Lagos, Nigeria
                </p>
              </div>
              <p className="text-gray-700 text-sm">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-taja-primary to-purple-600 hover:from-taja-primary/90 hover:to-purple-600/90">
                I Understand - Continue Registration
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline">Read Terms of Service</Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            By continuing, you acknowledge that you have read and understand our
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}




