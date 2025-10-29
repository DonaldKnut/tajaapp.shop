"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  Camera,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import toast from "react-hot-toast";

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface VerificationData {
  nin: string;
  businessName?: string;
  businessAddress?: string;
  businessType: "individual" | "business";
  documents: {
    ninImage?: File;
    selfie?: File;
    businessRegistration?: File;
    utilityBill?: File;
  };
}

const verificationSteps: VerificationStep[] = [
  {
    id: "nin",
    title: "National Identity Number (NIN)",
    description: "Verify your identity with your NIN",
    completed: false,
    required: true,
  },
  {
    id: "selfie",
    title: "Selfie Verification",
    description: "Take a clear selfie for identity confirmation",
    completed: false,
    required: true,
  },
  {
    id: "documents",
    title: "Supporting Documents",
    description: "Upload additional verification documents",
    completed: false,
    required: false,
  },
];

export default function SellerVerificationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData>({
    nin: "",
    businessType: "individual",
    documents: {},
  });
  const [steps, setSteps] = useState(verificationSteps);
  const [ninValidation, setNinValidation] = useState<{
    isValid?: boolean;
    data?: any;
    loading?: boolean;
  }>({});

  const validateNIN = async (nin: string) => {
    if (nin.length !== 11) {
      setNinValidation({ isValid: false });
      return;
    }

    setNinValidation({ loading: true });

    try {
      // TODO: Integrate with actual NIN verification API
      // For demo, simulate API call
      setTimeout(() => {
        const mockValidation = {
          isValid: true,
          data: {
            fullName: "John Doe",
            dateOfBirth: "1990-01-01",
            gender: "Male",
          },
        };
        setNinValidation(mockValidation);

        if (mockValidation.isValid) {
          updateStepCompletion("nin", true);
          toast.success("NIN verified successfully!");
        }
      }, 2000);
    } catch (error) {
      setNinValidation({ isValid: false });
      toast.error("NIN verification failed");
    }
  };

  const updateStepCompletion = (stepId: string, completed: boolean) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, completed } : step))
    );
  };

  const handleNINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nin = e.target.value.replace(/\D/g, "").slice(0, 11);
    setVerificationData((prev) => ({ ...prev, nin }));

    if (nin.length === 11) {
      validateNIN(nin);
    } else {
      setNinValidation({});
    }
  };

  const handleFileUpload = async (
    file: File,
    type: keyof VerificationData["documents"]
  ) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setVerificationData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file,
      },
    }));

    // Update step completion
    if (type === "selfie") {
      updateStepCompletion("selfie", true);
    } else if (
      type === "ninImage" ||
      type === "businessRegistration" ||
      type === "utilityBill"
    ) {
      updateStepCompletion("documents", true);
    }

    toast.success("Document uploaded successfully");
  };

  const capturePhoto = async (type: keyof VerificationData["documents"]) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Create canvas for photo capture
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Wait for video to load then capture
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        setTimeout(() => {
          context?.drawImage(video, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const file = new File([blob], `${type}-${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });
                handleFileUpload(file, type);
              }

              // Stop camera
              stream.getTracks().forEach((track) => track.stop());
            },
            "image/jpeg",
            0.8
          );
        }, 3000); // 3 second delay for user to position
      };
    } catch (error) {
      toast.error("Camera access denied or not available");
    }
  };

  const submitVerification = async () => {
    // Validate required steps
    const requiredSteps = steps.filter((step) => step.required);
    const incompleteSteps = requiredSteps.filter((step) => !step.completed);

    if (incompleteSteps.length > 0) {
      toast.error("Please complete all required verification steps");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nin", verificationData.nin);
      formData.append("businessType", verificationData.businessType);

      if (verificationData.businessName) {
        formData.append("businessName", verificationData.businessName);
      }
      if (verificationData.businessAddress) {
        formData.append("businessAddress", verificationData.businessAddress);
      }

      // Append files
      Object.entries(verificationData.documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Verification submitted successfully! We'll review your documents within 24-48 hours."
        );
        // Redirect to dashboard with pending verification status
        window.location.href = "/seller/dashboard?verification=pending";
      } else {
        toast.error(data.message || "Verification submission failed");
      }
    } catch (error) {
      toast.error("Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "nin":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National Identity Number (NIN) *
              </label>
              <input
                type="text"
                value={verificationData.nin}
                onChange={handleNINChange}
                placeholder="Enter your 11-digit NIN"
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
              />

              {ninValidation.loading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  Verifying NIN...
                </div>
              )}

              {ninValidation.isValid === true && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  NIN verified successfully
                </div>
              )}

              {ninValidation.isValid === false && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Invalid NIN. Please check and try again.
                </div>
              )}
            </div>

            {ninValidation.data && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                  Verified Information
                </h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {ninValidation.data.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {ninValidation.data.dateOfBirth}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {ninValidation.data.gender}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                value={verificationData.businessType}
                onChange={(e) =>
                  setVerificationData((prev) => ({
                    ...prev,
                    businessType: e.target.value as "individual" | "business",
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
              >
                <option value="individual">Individual Seller</option>
                <option value="business">Business/Company</option>
              </select>
            </div>

            {verificationData.businessType === "business" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={verificationData.businessName || ""}
                    onChange={(e) =>
                      setVerificationData((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    value={verificationData.businessAddress || ""}
                    onChange={(e) =>
                      setVerificationData((prev) => ({
                        ...prev,
                        businessAddress: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-taja-primary focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        );

      case "selfie":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-taja-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-12 w-12 text-taja-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Take a Selfie
              </h3>
              <p className="text-gray-600 mb-6">
                Please take a clear selfie showing your face clearly. Make sure
                you're in good lighting and looking directly at the camera.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => capturePhoto("selfie")}
                variant="outline"
                className="h-32 flex-col space-y-2"
              >
                <Camera className="h-8 w-8" />
                <span>Use Camera</span>
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "selfie");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-taja-primary hover:bg-taja-primary/5">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-600">Upload Photo</span>
                </div>
              </div>
            </div>

            {verificationData.documents.selfie && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800">
                  Selfie uploaded successfully
                </span>
              </div>
            )}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Supporting Documents
              </h3>
              <p className="text-gray-600 mb-6">
                Upload additional documents to complete your verification
                (optional but recommended)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIN Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  NIN Slip/Card (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "ninImage");
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-taja-primary hover:bg-taja-primary/5">
                    {verificationData.documents.ninImage ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Utility Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Utility Bill (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "utilityBill");
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-taja-primary hover:bg-taja-primary/5">
                    {verificationData.documents.utilityBill ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Business Registration (if business type) */}
              {verificationData.businessType === "business" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Business Registration Certificate (Required for businesses)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          handleFileUpload(file, "businessRegistration");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-taja-primary hover:bg-taja-primary/5">
                      {verificationData.documents.businessRegistration ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/seller/dashboard"
              className="flex items-center space-x-2 text-taja-primary hover:text-taja-primary/80"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>

            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-taja-primary" />
              <span className="text-xl font-bold text-taja-dark">
                Taja.Shop
              </span>
            </Link>

            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-taja-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-taja-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seller Verification
          </h1>
          <p className="text-gray-600">
            Complete your verification to start selling on Taja.Shop
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed
                      ? "bg-green-600 text-white"
                      : index === currentStep
                      ? "bg-taja-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-px ml-2 ${
                      step.completed ? "bg-green-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
                }
                disabled={
                  steps[currentStep].required && !steps[currentStep].completed
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitVerification}
                disabled={
                  loading ||
                  steps.some((step) => step.required && !step.completed)
                }
                className="bg-taja-primary hover:bg-taja-primary/90"
              >
                {loading ? "Submitting..." : "Submit Verification"}
              </Button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  Verification Process
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your documents will be reviewed within 24-48 hours</li>
                  <li>
                    • You'll receive an email notification once verification is
                    complete
                  </li>
                  <li>
                    • Verified sellers get a trust badge and higher visibility
                  </li>
                  <li>• All personal information is encrypted and secure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



