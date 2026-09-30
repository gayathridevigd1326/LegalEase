"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Template } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  FileText,
  Briefcase,
  Building,
  Shield,
  User,
  ArrowRight,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.templates.list();
      if (res.success && res.data) {
        setTemplates(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const categories = [
    "All",
    "Business",
    "Employment",
    "Real Estate",
    "Freelance",
    "Confidentiality",
    "Personal",
    "General",
  ];

  const filtered = templates.filter((t) => {
    const matchCat =
      selectedCategory === "All" ||
      t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "business":
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case "employment":
        return <User className="h-5 w-5 text-indigo-600" />;
      case "real estate":
        return <Building className="h-5 w-5 text-emerald-600" />;
      case "confidentiality":
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Template Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Standard, vetted legal templates with dynamic customizable clauses ({templates.length} available).
          </p>
        </div>
        <Link href="/dashboard/documents/new">
          <Button size="sm" className="gap-2 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Custom Document
          </Button>
        </Link>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by contract name, role, or keywords..."
            className="pl-9 h-10 text-sm bg-white dark:bg-slate-900"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-xs text-slate-400">Loading templates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No templates found</p>
          <p className="text-xs text-slate-500 mt-1">Try searching with different terms or category.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="flex flex-col justify-between border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all dark:border-slate-800 dark:hover:border-blue-800"
            >
              <CardHeader className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(tmpl.category)}
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {tmpl.category}
                  </Badge>
                </div>

                <CardTitle className="text-base mt-3 leading-snug">
                  {tmpl.name}
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {tmpl.description}
                </p>
              </CardHeader>

              <div className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mb-3">
                  <span>{tmpl.schema?.fields?.length || 4} custom fields</span>
                  <span>{tmpl.jurisdiction || "Multi-jurisdiction"}</span>
                </div>

                <Link href={`/dashboard/documents/new?template=${encodeURIComponent(tmpl.name)}`}>
                  <Button variant="primary" size="sm" className="w-full gap-1.5 text-xs shadow-sm">
                    Use Template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
