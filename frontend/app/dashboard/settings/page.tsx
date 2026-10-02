"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Shield,
  Palette,
  Cpu,
  MapPin,
  CheckCircle,
  Lock,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  // Profile Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences
  const [defaultJurisdiction, setDefaultJurisdiction] = useState("General Commercial Law");
  const [themePreference, setThemePreference] = useState("system");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await api.auth.updateProfile({ full_name: fullName, email });
    setSavingProfile(false);
    if (res.success) {
      success("Profile information updated.");
      refreshUser();
    } else {
      toastError(res.error?.message || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError("New password must be at least 6 characters.");
      return;
    }
    setSavingPassword(true);
    const res = await api.auth.updateProfile({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setSavingPassword(false);
    if (res.success) {
      success("Password successfully changed.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      toastError(res.error?.message || "Password update failed. Verify current password.");
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setThemePreference(theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    success(`Appearance updated to ${theme} mode.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal profile, security credentials, appearance, and drafting defaults.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Personal Profile
          </CardTitle>
          <p className="text-xs text-slate-500">
            This name will be used as the default creator for new legal documents.
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <Button type="submit" size="sm" isLoading={savingProfile} className="text-xs">
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            Security & Password
          </CardTitle>
          <p className="text-xs text-slate-500">
            Ensure your account is protected with a strong, distinct password.
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={savingPassword}
              disabled={!currentPassword || !newPassword}
              className="text-xs"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance & Drafting Defaults */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Appearance */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  themePreference === "light"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <Sun className="h-5 w-5 mb-1 text-amber-500" />
                Light
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  themePreference === "dark"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <Moon className="h-5 w-5 mb-1 text-indigo-400" />
                Dark
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  themePreference === "system"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <Laptop className="h-5 w-5 mb-1 text-slate-500" />
                System
              </button>
            </div>
          </CardContent>
        </Card>

        {/* AI & Legal Defaults */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              AI Drafting Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">AI Provider</span>
              <Badge variant="generated">Google Gemini / Local Engine</Badge>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Security Mode</span>
              <span className="font-semibold text-emerald-600">Zero Data Training</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Preferred Jurisdiction</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {defaultJurisdiction}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
