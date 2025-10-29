"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Array<{
    id: string;
    type: "home" | "work" | "other";
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    categories: string[];
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    addresses: [],
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      categories: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // TODO: Fetch user profile from API
    // Mock data for now
    setProfile({
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 801 234 5678",
      avatar: "/placeholder-avatar.jpg",
      addresses: [
        {
          id: "1",
          type: "home",
          street: "123 Main Street",
          city: "Lagos",
          state: "Lagos",
          postalCode: "100001",
          country: "Nigeria",
          isDefault: true,
        },
      ],
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
        categories: ["fashion", "electronics"],
      },
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Update profile via API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (index: number, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const handlePreferenceChange = (
    category: string,
    field: string,
    value: any
  ) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category as keyof typeof prev.preferences],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!editing}
                      className="flex items-center"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      value={profile.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Addresses
                </h3>
                {editing && (
                  <Button size="sm" variant="outline">
                    Add Address
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {profile.addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {address.type} Address
                          </span>
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state}{" "}
                          {address.postalCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.country}
                        </p>
                      </div>
                      {editing && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {profile.addresses.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No addresses saved
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Order updates, promotions, and account changes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.email}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "notifications",
                        "email",
                        e.target.checked
                      )
                    }
                    disabled={!editing}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      SMS Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Order updates and important alerts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.sms}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "notifications",
                        "sms",
                        e.target.checked
                      )
                    }
                    disabled={!editing}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Push Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Real-time updates and promotions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.push}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "notifications",
                        "push",
                        e.target.checked
                      )
                    }
                    disabled={!editing}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

