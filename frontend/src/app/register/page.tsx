"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  LifeBuoy,
  BookOpen,
  Rocket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { z } from "zod";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const registerSchema = z
    .object({
      fullName: z.string().min(2, { message: "Enter your full name" }),
      email: z.string().email({ message: "Enter a valid email" }),
      phone: z.string().regex(phoneRegex, { message: "Enter a valid Nigerian phone" }),
      password: z
        .string()
        .regex(passwordRegex, {
          message:
            "Min 8 chars with uppercase, lowercase, number and special character",
        }),
      confirmPassword: z.string(),
      role: z.enum(["buyer", "seller"]),
      agreeToTerms: z.literal(true, { errorMap: () => ({ message: "Please agree to the terms" }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = (issue.path[0] as string) || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || "Please fix the errors");
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        router.push("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      const next = { ...errors };
      delete next[e.target.name];
      setErrors(next);
    }
  };

  const isFormValid = registerSchema.safeParse(formData).success;

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const name = e.target.name as keyof typeof formData;
    // For confirmPassword or any cross-field, validate the whole form to get proper error
    if (name === "confirmPassword") {
      const parsed = registerSchema.safeParse(formData);
      if (!parsed.success) {
        const issue = parsed.error.issues.find((i) => i.path[0] === "confirmPassword");
        if (issue) setErrors({ ...errors, confirmPassword: issue.message });
      }
      return;
    }
    // Validate single field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseSchema: any = (registerSchema as any)._def?.schema ?? registerSchema;
    const singleShape: any = { [name]: (baseSchema.shape as any)[name] };
    const single = z.object(singleShape);
    const parsed = single.safeParse({ [name]: (formData as any)[name] });
    if (!parsed.success) {
      setErrors({ ...errors, [name as string]: parsed.error.issues[0]?.message });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
    if (errors[e.target.name]) {
      const next = { ...errors };
      delete next[e.target.name];
      setErrors(next);
    }
  };

  return (
    <div className="h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full w-screen">
        {/* Left: Form */}
        <div className="bg-white p-6 sm:p-10 h-full overflow-y-auto">
          <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center px-4 sm:px-0">
            <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Taja.Shop
            </h2>
            <p className="mt-1 text-sm text-gray-500">Create your account</p>
            </div>

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
        
          
            <div className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  onBlur={handleBlur}
                    className="pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

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
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  onBlur={handleBlur}
                    className="pl-10"
                    placeholder="+234 801 234 5678"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  I want to
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="buyer">Buy products</option>
                  <option value="seller">Sell products</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                )}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  onBlur={handleBlur}
                    className="pl-10 pr-10"
                    placeholder="Create a strong password"
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
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  onBlur={handleBlur}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-emerald-600 hover:text-emerald-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-600 hover:text-emerald-500"
                >
                  Privacy Policy
                </Link>
              </label>
              {errors.agreeToTerms && (
                <p className="ml-3 text-xs text-red-600">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gray-900 text-white hover:bg-black flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Sign in
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
          {/* Presented by */}
          <div className="mt-10">
            <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              presented by
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                A
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Right: Advert/Info Panel */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 sm:p-10 text-gray-100 hidden md:block md:sticky md:top-0 md:h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.15),transparent_40%)]" />
          <div className="relative h-full flex flex-col justify-center space-y-4">
            <a
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              href="#"
            >
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2">
                  <svg className="hidden" />
                </div>
                <div className="flex items-start">
                  <div className="mr-3 rounded-lg bg-white/10 p-2">
                    {/* Icon slot */}
                  </div>
                </div>
              </div>
            </a>
            {/* Items */}
            <a
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              href="#"
            >
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Visit our Support Center
                  </p>
                  <p className="text-xs text-gray-300">
                    Get guidance from our support team
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              href="#"
            >
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    View our Product Roadmap
                  </p>
                  <p className="text-xs text-gray-300">
                    Browse and vote on what's next
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              href="#"
            >
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Check out the latest releases
                  </p>
                  <p className="text-xs text-gray-300">
                    See new features and updates
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              href="#"
            >
              <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-white/10 p-2">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Join our Slack Community
                  </p>
                  <p className="text-xs text-gray-300">
                    Discuss with other sellers
                  </p>
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
