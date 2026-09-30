"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Download,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Lock,
  ChevronRight,
  FileDown,
  Layers,
  HelpCircle,
  ScanSearch,
  BookOpen,
  Briefcase,
  UserCheck,
  Building2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Generation Legal Intelligence SaaS</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                LEGAL <span className="text-blue-600">EASE</span>
              </h1>

              <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-300 tracking-tight">
                Draft Smarter. Understand Better.
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Transform complex agreements into structured, enforceable drafts in minutes.
                Draft with specialized AI, review hidden liabilities, and export in publication-ready PDF, Word, or plain text.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/20 text-sm font-semibold">
                    Create Your Document
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm">
                    Explore Templates (17+)
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-emerald-600" /> 256-Bit SSL Encryption</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-600" /> Never Trains on Your Data</span>
                <span className="flex items-center gap-1.5"><FileCheck className="h-4 w-4 text-indigo-600" /> 17+ Commercial Templates</span>
              </div>
            </div>

            {/* Interactive Hero Visual Preview (Section 18) */}
            <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-slate-400">LegalEase Studio — Mutual Non-Disclosure Agreement.pdf</span>
                  </div>
                  <Badge variant="generated" className="text-[10px]">AI Validated Draft</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
                  <div className="md:col-span-8 space-y-3 font-serif bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <h3 className="font-bold text-base text-center uppercase tracking-wide text-slate-900 dark:text-white">
                      MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans text-center">
                      Jurisdiction: Delaware, United States &bull; Effective Date: October 2026
                    </p>
                    <div className="pt-2 text-xs leading-relaxed space-y-2 text-slate-800 dark:text-slate-200">
                      <p>
                        <strong>1. DEFINITION OF CONFIDENTIAL INFORMATION:</strong> &quot;Confidential Information&quot; refers to all proprietary technical data, trade secrets, software algorithms, customer lists, and financial projections disclosed by either party...
                      </p>
                      <p>
                        <strong>2. NON-DISCLOSURE AND STANDARD OF CARE:</strong> The Receiving Party agrees to maintain the Confidential Information in strict confidence, exercising at least the degree of care it employs for its own trade secrets, but no less than a reasonable standard...
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-3">
                    <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/40 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        AI Clause Optimizer
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Proposed revision strengthens trade secret survival period to perpetuity.
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Badge variant="final" className="text-[10px]">Protection: High</Badge>
                        <Badge variant="outline" className="text-[10px]">Non-Destructive</Badge>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Export Formats</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">.PDF</span>
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">.DOCX</span>
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">.TXT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (Section 19) */}
        <section id="how-it-works" className="py-20 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Simple 3-Step Process
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                How LegalEase Works
              </p>
              <p className="mt-3 text-sm text-slate-500">
                From initial blank slate to fully reviewed, signed-ready legal document in under 3 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-200/90 p-8 text-center bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-lg mx-auto mb-5 shadow-md shadow-blue-500/20">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Document</h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Select from 17+ industry-standard templates: Employment, NDA, Leases, Freelance, or specify a Custom Agreement.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 p-8 text-center bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-lg mx-auto mb-5 shadow-md shadow-indigo-500/20">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Provide Your Details</h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Enter contracting parties, governing jurisdiction, payment terms, duration, and custom natural-language instructions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 p-8 text-center bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg mx-auto mb-5 shadow-md shadow-emerald-500/20">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generate, Edit & Export</h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  AI formats the contract with recitals and signatures. Polish clauses with AI Assistant, track versions, and export to PDF, DOCX, or TXT.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES SHOWCASE (Section 15) */}
        <section id="templates" className="py-20 bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Ready-to-Use Contracts
                </h2>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Built-In Legal Templates
                </p>
              </div>
              <Link href="/dashboard/templates">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  View All 17+ Templates
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Employment Contract", category: "Employment", desc: "Comprehensive salary, duties, IP assignment, and termination provisions." },
                { title: "Non-Disclosure Agreement (NDA)", category: "Confidentiality", desc: "Bilateral or unilateral protection for trade secrets and technical discussions." },
                { title: "Lease Agreement", category: "Real Estate", desc: "Commercial & residential tenancy rights, security deposits, and maintenance." },
                { title: "Freelance Agreement", category: "Freelance", desc: "Scope of work, milestone payments, deadlines, and IP ownership transfers." },
                { title: "Service Agreement", category: "Business", desc: "B2B commercial agreements with SLA benchmarks, deliverables, and liability caps." },
                { title: "Consulting Agreement", category: "Business", desc: "Executive advisory scope, retainer fees, non-compete, and confidentiality." },
              ].map((t, i) => (
                <div key={i} className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 transition-all shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] font-semibold">{t.category}</Badge>
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{t.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.desc}</p>
                  <Link href={`/dashboard/documents/new?template=${encodeURIComponent(t.title)}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-4">
                    Draft this document &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI CAPABILITIES & FEATURES (Section 8, 10, 11) */}
        <section id="features" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Precision Intelligence
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Engineered for Legal Accuracy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Structured Prompt Pipeline</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Strict system prompts ensure consistent terminology, defined parties, and complete prohibition of fabricated citations or invented case law.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Non-Destructive AI Assistant</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  AI never modifies your document silently. Proposed clause improvements show an interactive side-by-side diff with explicit Accept and Reject buttons.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Format Legal Export</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Export directly to court-ready PDF with running headers and footers, fully formatted Word DOCX with signature tables, or clean plain text.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENT ANALYZER SHOWCASE (Section 12) */}
        <section id="analyzer" className="py-20 bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <Badge variant="outline" className="text-xs">
                  Document Intelligence
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Audit Existing Contracts in Seconds
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Already have a contract from a counterparty? Upload existing PDF, Word DOCX, or TXT files.
                  Our document extractor and legal audit engine instantly returns:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Plain-language executive summary of the entire agreement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Key clause breakdown (Payment, Termination, Liability, Indemnity)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Critical risk factors and negotiation recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Curated questions to review with licensed legal counsel
                  </li>
                </ul>
                <div className="pt-2">
                  <Link href="/dashboard/analyze">
                    <Button variant="primary" size="md" className="gap-2 shadow-sm">
                      <ScanSearch className="h-4 w-4" />
                      Try Document Analyzer Now
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Analysis Snapshot</span>
                  <Badge variant="final" className="text-[10px]">Audit Passed</Badge>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Liability Risk Detected</span>
                  <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                    Indemnification obligation is uncapped. Consider proposing a 12-month fee ceiling.
                  </p>
                </div>
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-blue-900 dark:text-blue-200">Missing Information</span>
                  <p className="text-blue-800 dark:text-blue-300 text-[11px]">
                    No explicit notice period defined for termination without cause.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Common Questions
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Frequently Asked Questions
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Does LegalEase provide legally binding advice?",
                  a: "No. LegalEase is an AI drafting and information platform. It generates high-quality first drafts and plain-language summaries for informational review, but does not replace review by qualified legal counsel."
                },
                {
                  q: "Can I use LegalEase without an external Gemini API key?",
                  a: "Yes! LegalEase includes a comprehensive built-in Mock AI provider enabled by default (MOCK_AI=true), allowing full offline drafting, clause improvement, and analysis testing without requiring any API key."
                },
                {
                  q: "What export formats are supported?",
                  a: "You can download your finalized contracts as publication-ready PDFs with running headers/footers, Microsoft Word DOCX files with signature tables, or clean plain text TXT."
                },
                {
                  q: "Is my document data secure?",
                  a: "Yes. All user documents are isolated to your authenticated account with password hashing (bcrypt) and JWT security. We do not use user document data to train external AI models."
                }
              ].map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{faq.q}</h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
