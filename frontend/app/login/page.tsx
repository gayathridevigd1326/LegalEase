"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Sparkles, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const { success } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      success("Welcome back to LegalEase!");
      router.push("/dashboard");
    } else {
      setErrorMsg(res.error || "Login failed. Please check your credentials.");
    }
  };

  const handleUseDemo = () => {
    setEmail("demo@legalease.app");
    setPassword("password123");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Or{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10 dark:bg-slate-900 dark:border-slate-800">
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">
                  Fast Evaluation
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseDemo}
                className="w-full gap-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                Fill Demo Credentials (demo@legalease.app)
              </Button>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Protected with 256-bit encryption. Never shares your draft documents.
        </p>
      </div>
    </div>
  );
}
