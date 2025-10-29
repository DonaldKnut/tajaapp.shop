"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { z } from "zod";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const loginSchema = z.object({
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  });

  const isFormValid = loginSchema.safeParse(formData).success;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target as { name: "email" | "password" };
    const single = loginSchema.pick({ [name]: true } as any);
    const parsed = single.safeParse({ [name]: formData[name] } as any);
    if (!parsed.success) {
      setErrors({ ...errors, [name]: parsed.error.issues[0]?.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = loginSchema.safeParse(formData);
    if (!parse.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      parse.error.issues.forEach((issue) => {
        const path = issue.path[0] as "email" | "password";
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || "Please fix the errors");
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name as "email" | "password"]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  return (
    <div className="h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full w-screen">
        <div className="bg-white p-6 sm:p-10 h-full overflow-y-auto">
          <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center space-y-8 px-4 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Taja.Shop account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
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
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Forgot your password?
              </Link>
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
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
        {/* Back Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="mt-2 inline-block text-sm text-emerald-600 hover:text-emerald-500"
          >
            Back to Home
          </Link>
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
                  <p className="text-sm font-semibold">Secure and fast checkout</p>
                  <p className="text-xs text-gray-300">Your data is protected</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </a>
            <a className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition" href="#">
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2" />
                <div>
                  <p className="text-sm font-semibold">Join our community</p>
                  <p className="text-xs text-gray-300">Connect with other sellers</p>
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
