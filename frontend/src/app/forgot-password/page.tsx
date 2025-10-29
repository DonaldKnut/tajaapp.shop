"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { z } from "zod";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotSchema = z.object({
    email: z.string().email({ message: "Enter a valid email" }),
  });

  const isFormValid = forgotSchema.safeParse({ email }).success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Please enter a valid email";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success("Password reset link sent to your email!");
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-screen">
          <div className="bg-white p-6 sm:p-10 h-full overflow-y-auto">
            <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center space-y-8 px-4 sm:px-0">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="font-medium text-emerald-600 hover:text-emerald-500"
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
            <div className="mt-3 text-center">
              <Link
                href="/"
                className="inline-block text-sm text-emerald-600 hover:text-emerald-500"
              >
                Back to Home
              </Link>
            </div>
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 sm:p-10 text-gray-100 hidden md:block md:sticky md:top-0 md:h-screen">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.15),transparent_40%)]" />
            <div className="relative h-full flex flex-col justify-center space-y-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full w-screen">
        <div className="bg-white p-6 sm:p-10 h-full overflow-y-auto">
          <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center space-y-8 px-4 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Reset Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={(e) => {
                  const parsed = forgotSchema.safeParse({ email: e.target.value });
                  if (!parsed.success) setError(parsed.error.issues[0]?.message || "Invalid email");
                }}
                className="pl-10"
                placeholder="Enter your email"
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          <div className="mt-2">
            <Link
              href="/"
              className="inline-block text-sm text-emerald-600 hover:text-emerald-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 sm:p-10 text-gray-100 hidden md:block md:sticky md:top-0 md:h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.15),transparent_40%)]" />
          <div className="relative h-full flex flex-col justify-center space-y-4">
            <a className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition" href="#">
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2" />
                <div>
                  <p className="text-sm font-semibold">Need help?</p>
                  <p className="text-xs text-gray-300">Visit our support center</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
