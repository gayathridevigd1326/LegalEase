"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  BookOpen,
  ScanSearch,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Documents", href: "/dashboard/documents", icon: FileText },
    { label: "Create Document", href: "/dashboard/documents/new", icon: FilePlus },
    { label: "Templates", href: "/dashboard/templates", icon: BookOpen },
    { label: "Analyze Document", href: "/dashboard/analyze", icon: ScanSearch },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-slate-200/80 dark:border-slate-800">
          <Logo href="/dashboard" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </Link>
            );
          })}
        </div>

        {/* Informational Disclaimer Card */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight">
              AI drafts are for informational review only. Not qualified legal advice.
            </p>
          </div>
        </div>

        {/* User profile footer */}
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user?.full_name || "User"}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {user?.email || "user@legalease.app"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
