"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "./types";
import { api, setToken } from "./api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.access_token);
      setUser(res.data.user);
      return { success: true };
    }
    return {
      success: false,
      error: res.error?.message || "Invalid credentials. Please try again.",
    };
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.auth.register({ email, password, full_name: fullName });
    if (res.success && res.data) {
      setToken(res.data.access_token);
      setUser(res.data.user);
      return { success: true };
    }
    return {
      success: false,
      error: res.error?.message || "Registration failed.",
    };
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
