import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AlertCircle, Shield, FileCheck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Legal Safety Banner */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-start gap-3.5">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-slate-200">Legal Disclaimer: </span>
            LegalEase provides AI-generated legal information and document drafts for informational purposes only.
            It does not provide legal advice and does not replace review by a qualified legal professional.
            Laws, regulations, and execution requirements vary substantially by country, state, and municipality. Always consult licensed counsel before executing binding contracts.
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Draft Smarter. Understand Better. AI-powered drafting, clause intelligence, and document analysis built for modern founders, operators, and professionals.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> 256-Bit SSL</span>
              <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Zero Data Training</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Templates
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Employment Contract</Link></li>
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Non-Disclosure Agreement</Link></li>
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Lease & Rental Agreement</Link></li>
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Freelance Agreement</Link></li>
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Master Service Agreement</Link></li>
              <li><Link href="/dashboard/templates" className="hover:text-blue-600 font-medium text-blue-600">View All 17+ &rarr;</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/dashboard/documents/new" className="hover:text-blue-600">Document Drafting Wizard</Link></li>
              <li><Link href="/dashboard/analyze" className="hover:text-blue-600">PDF & DOCX Analyzer</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Clause Improver & Simplifier</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Plain English Explainer</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Version History & Rollback</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-blue-600">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Create Free Account</Link></li>
              <li><Link href="/dashboard/settings" className="hover:text-blue-600">Security & Privacy</Link></li>
              <li><Link href="/dashboard/documents" className="hover:text-blue-600">Document Library</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} LegalEase SaaS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Draft Smarter. Understand Better.</p>
        </div>
      </div>
    </footer>
  );
}
