import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Sparkles } from "lucide-react";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white group">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 ${iconSizes[size]}`}>
        <FileText className="h-4 w-4 stroke-[2.2]" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
      </div>
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight ${textSizes[size]}`}>
          LEGAL<span className="text-blue-600">EASE</span>
        </span>
      </div>
    </Link>
  );
}
