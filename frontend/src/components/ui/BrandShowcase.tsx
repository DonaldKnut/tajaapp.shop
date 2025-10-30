"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
  Headphones,
  Zap,
  Target,
  TrendingUp,
  Award,
  Crown,
  Diamond,
  Gem,
  Trophy,
  Sparkles,
  Wand2,
  Rocket,
  BarChart3,
  PieChart,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Flag,
  MoreHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  ExternalLink,
  Check,
  X as XIcon,
  Minus,
  Plus,
  Edit3,
  Copy,
  Bookmark,
  Settings,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  InfoIcon,
  Lightbulb,
  LightbulbOff,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  Wind as WindIcon,
  Droplets as DropletsIcon,
  Thermometer as ThermometerIcon,
  Gauge as GaugeIcon,
  
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Create Your Shop",
    description:
      "Set up your digital storefront in minutes with our easy-to-use tools",
    icon: ShoppingBag,
    color: "from-blue-500 to-blue-600",
    features: [
      "Custom shop design",
      "Easy product upload",
      "Inventory management",
      "Order tracking",
    ],
    image: "/images/step1-create-shop.jpg",
    video: "/videos/step1-create-shop.mp4",
  },
  {
    id: 2,
    title: "List Your Products",
    description:
      "Upload products with photos, videos, and detailed descriptions",
    icon: Target,
    color: "from-green-500 to-green-600",
    features: [
      "Photo & video uploads",
      "Detailed specifications",
      "SEO optimization",
      "Category management",
    ],
    image: "/images/step2-list-products.jpg",
    video: "/videos/step2-list-products.mp4",
  },
  {
    id: 3,
    title: "Get Verified",
    description: "Build trust with customers through our verification process",
    icon: Shield,
    color: "from-purple-500 to-purple-600",
    features: [
      "Identity verification",
      "Business registration",
      "Quality assurance",
      "Trust badges",
    ],
    image: "/images/step3-get-verified.jpg",
    video: "/videos/step3-get-verified.mp4",
  },
  {
    id: 4,
    title: "Start Selling",
    description: "Receive orders, process payments, and grow your business",
    icon: TrendingUp,
    color: "from-orange-500 to-orange-600",
    features: [
      "Secure payments",
      "Order management",
      "Customer support",
      "Analytics dashboard",
    ],
    image: "/images/step4-start-selling.jpg",
    video: "/videos/step4-start-selling.mp4",
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-level security with escrow protection",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Nationwide shipping with tracking",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here to help you succeed",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Star,
    title: "Quality Guarantee",
    description: "100% satisfaction or your money back",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
];

const stats = [
  { number: "50K+", label: "Active Sellers", icon: Users },
  { number: "500K+", label: "Products Listed", icon: ShoppingBag },
  { number: "1M+", label: "Happy Customers", icon: Heart },
  { number: "99.9%", label: "Uptime", icon: Activity },
];

const testimonials = [
  {
    name: "Amina Okafor",
    role: "Fashion Seller",
    avatar: "/images/testimonials/amina.jpg",
    content:
      "Taja.Shop transformed my WhatsApp business into a professional online store. Sales increased by 300% in just 3 months!",
    rating: 5,
    verified: true,
  },
  {
    name: "Chinedu Okwu",
    role: "Electronics Dealer",
    avatar: "/images/testimonials/chinedu.jpg",
    content:
      "The verification process gave my customers confidence. Now they trust me completely and I get more repeat customers.",
    rating: 5,
    verified: true,
  },
  {
    name: "Fatima Ibrahim",
    role: "Handmade Crafts",
    avatar: "/images/testimonials/fatima.jpg",
    content:
      "I love how easy it is to upload products with videos. My customers can see exactly what they're buying.",
    rating: 5,
    verified: true,
  },
];

export function BrandShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const hoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-taja-primary/10 text-taja-primary border-taja-primary/20">
            <Sparkles className="h-4 w-4 mr-2" />
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            From WhatsApp Chaos to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-taja-primary to-purple-600">
              {" "}
              Your Own Shop
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of Nigerian entrepreneurs who've transformed their
            businesses with Taja.Shop's powerful tools and features.
          </p>
        </div>

        {/* Steps Carousel */}
        <div className="mb-20">
          <div className="relative">
            {/* Step Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${steps[currentStep].color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {steps[currentStep].id}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-gray-600">
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {steps[currentStep].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-taja-primary to-purple-600 hover:from-taja-primary/90 hover:to-purple-600/90"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <StepIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Step {steps[currentStep].id} Preview
                      </p>
                    </div>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentStep === index
                        ? "bg-taja-primary"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Taja.Shop?
            </h3>
            <p className="text-xl text-gray-600">
              Everything you need to succeed in e-commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-taja-primary to-purple-600 rounded-2xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Trusted by Thousands</h3>
              <p className="text-xl text-white/90">
                Join the growing community of successful sellers
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Sellers Say
            </h3>
            <p className="text-xl text-gray-600">
              Real stories from real entrepreneurs
            </p>
          </div>

          <div
            className="relative"
            ref={hoverRef}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    animate={{ x: `-${currentTestimonial * 100}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                  >
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="min-w-full shrink-0 grow-0 p-8">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-6 flex items-center justify-center">
                            <Users className="h-10 w-10 text-gray-400" />
                          </div>
                          <AnimatePresence mode="wait">
                            <motion.blockquote
                              key={currentTestimonial === idx ? `q-${idx}` : `q-hidden-${idx}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.35 }}
                              className="text-xl text-gray-700 mb-6 italic"
                            >
                              “{t.content}”
                            </motion.blockquote>
                          </AnimatePresence>
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <div className="font-semibold text-gray-900">{t.name}</div>
                          <div className="text-gray-600">{t.role}</div>
                          {t.verified && (
                            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Seller
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentTestimonial === index
                      ? "bg-taja-primary"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
              <button
                className="pointer-events-auto ml-2 md:ml-4 rounded-full bg-white/90 hover:bg-white shadow p-2"
                onClick={() =>
                  setCurrentTestimonial((prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="pointer-events-auto mr-2 md:mr-4 rounded-full bg-white/90 hover:bg-white shadow p-2"
                onClick={() =>
                  setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful sellers and transform your business
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-taja-primary to-purple-600 hover:from-taja-primary/90 hover:to-purple-600/90"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Selling Now
            </Button>
            <Button variant="outline" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
