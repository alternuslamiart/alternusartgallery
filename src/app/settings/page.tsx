"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  ChevronLeft,
  Save,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

type SettingsTab = "profile" | "notifications" | "security" | "billing" | "preferences";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Check localStorage for CEO login
  const [localUser, setLocalUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const userAuth = localStorage.getItem("userAuth");
    if (userAuth === "true") {
      setLocalUser({
        name: localStorage.getItem("userName") || "User",
        email: localStorage.getItem("userEmail") || "",
        role: localStorage.getItem("userRole") || "USER",
      });
    }
  }, []);

  const isLoggedIn = status === "authenticated" || localUser !== null;
  const user = session?.user || localUser;

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    website: "",
    location: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    emailArtwork: true,
    smsOrders: false,
    pushNotifications: true,
  });

  // Security form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      setProfileForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: "",
        bio: "",
        website: "",
        location: "",
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated" && !localUser) {
      router.push("/login");
    }
  }, [status, localUser, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: "profile" as SettingsTab, label: "Profile", icon: User },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "security" as SettingsTab, label: "Security", icon: Shield },
    { id: "billing" as SettingsTab, label: "Billing", icon: CreditCard },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: Palette },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-background rounded-xl p-2 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            <Separator className="my-6" />

            {/* Quick Links */}
            <div className="bg-background rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/profile" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <Link href="/help" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="w-4 h-4" />
                  Help & Support
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Success Toast */}
            {showSuccess && (
              <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Settings Saved!</p>
                    <p className="text-sm text-white/80">Your changes have been saved successfully.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and public profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                          {(profileForm.firstName || user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Button type="button" variant="outline" size="sm">
                            Change Photo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Name Fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          className="w-full px-3 py-2 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">Brief description for your profile. Max 200 characters.</p>
                      </div>

                      {/* Website & Location */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={profileForm.website}
                            onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>Choose what emails you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Updates</p>
                        <p className="text-sm text-muted-foreground">Receive emails about your order status</p>
                      </div>
                      <Switch
                        checked={notifications.emailOrders}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, emailOrders: checked });
                          handleSaveNotifications();
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Artwork Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when artists you follow upload new work</p>
                      </div>
                      <Switch
                        checked={notifications.emailArtwork}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, emailArtwork: checked });
                          handleSaveNotifications();
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive promotional offers and newsletters</p>
                      </div>
                      <Switch
                        checked={notifications.emailMarketing}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, emailMarketing: checked });
                          handleSaveNotifications();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>Manage your mobile and browser notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, pushNotifications: checked });
                          handleSaveNotifications();
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive SMS for urgent order updates</p>
                      </div>
                      <Switch
                        checked={notifications.smsOrders}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, smsOrders: checked });
                          handleSaveNotifications();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={securityForm.newPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods for purchases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium mb-2">No payment methods</p>
                      <p className="text-sm text-muted-foreground mb-4">Add a payment method to make purchases easier</p>
                      <Button>Add Payment Method</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View your past transactions and invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No billing history yet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize how you view the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                      </div>
                      <select className="px-3 py-2 border rounded-lg bg-background">
                        <option value="en">English</option>
                        <option value="sq">Shqip</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Francais</option>
                      </select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred currency for prices</p>
                      </div>
                      <select className="px-3 py-2 border rounded-lg bg-background">
                        <option value="EUR">EUR (Euro)</option>
                        <option value="USD">USD (Dollar)</option>
                        <option value="GBP">GBP (Pound)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Control your privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Online Status</p>
                        <p className="text-sm text-muted-foreground">Let others see when you are online</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Messages</p>
                        <p className="text-sm text-muted-foreground">Receive messages from other users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
