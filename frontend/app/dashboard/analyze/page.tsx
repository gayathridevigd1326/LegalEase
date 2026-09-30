"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { UploadResponse, DocumentAnalysisResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Loader2,
  FileCheck,
  History,
  FileUp,
  FileSearch,
  Sparkles,
} from "lucide-react";

export default function DocumentAnalyzerPage() {
  const { error: toastError, success } = useToast();

  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResponse | null>(null);
  const [analyzedDocName, setAnalyzedDocName] = useState<string>("");

  // Paste text option
  const [pastedText, setPastedText] = useState("");
  const [analyzingText, setAnalyzingText] = useState(false);

  // Past uploads history
  const [pastUploads, setPastUploads] = useState<UploadResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = async () => {
    setLoadingHistory(true);
    const res = await api.uploads.list();
    if (res.success && res.data) {
      setPastUploads(res.data);
    }
    setLoadingHistory(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx", "txt"].includes(ext || "")) {
        toastError("Invalid format. Please select a PDF, DOCX, or TXT document.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toastError("File exceeds 15MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setAnalysisResult(null);

    const res = await api.uploads.upload(selectedFile);
    setIsUploading(false);

    if (res.success && res.data) {
      success("Document uploaded and analyzed successfully!");
      setAnalysisResult(res.data.analysis || null);
      setAnalyzedDocName(res.data.filename);
      loadUploadHistory();
    } else {
      toastError(res.error?.message || "Failed to analyze document.");
    }
  };

  const handleAnalyzePastedText = async () => {
    if (pastedText.trim().length < 30) {
      toastError("Please paste at least one full contract clause or paragraph.");
      return;
    }

    setAnalyzingText(true);
    setAnalysisResult(null);

    const res = await api.ai.analyzeText(pastedText);
    setAnalyzingText(false);

    if (res.success && res.data) {
      success("Text analyzed successfully!");
      setAnalysisResult(res.data);
      setAnalyzedDocName("Pasted Contract Text");
    } else {
      toastError(res.error?.message || "Failed to analyze pasted text.");
    }
  };

  const handleSelectPastUpload = (item: UploadResponse) => {
    if (item.analysis) {
      setAnalysisResult(item.analysis);
      setAnalyzedDocName(item.filename);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Document Intelligence Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload any contract (PDF, DOCX, TXT) or paste clauses to extract plain-language summaries, uncover hidden liabilities, and identify missing protections.
        </p>
      </div>

      {/* Upload / Input Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200/90 dark:border-slate-800">
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 bg-slate-50/60 dark:bg-slate-900">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === "upload"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <FileUp className="h-4 w-4" />
                Upload File (PDF, DOCX, TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === "paste"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <FileText className="h-4 w-4" />
                Paste Raw Text
              </button>
            </div>

            <CardContent className="p-6">
              {activeTab === "upload" ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                    <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Select legal document to audit
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF, DOCX, and TXT files up to 15MB.
                    </p>

                    <label className="mt-4 inline-block">
                      <Button variant="outline" size="sm" type="button" className="cursor-pointer">
                        Browse Computer
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {selectedFile && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg inline-flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                        <FileCheck className="h-4 w-4" />
                        <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUploadAndAnalyze}
                    disabled={!selectedFile || isUploading}
                    isLoading={isUploading}
                    className="w-full gap-2 shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Extract and Analyze Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste contract terms, non-compete clauses, payment sections, or entire agreements here..."
                    className="text-xs sm:text-sm font-serif leading-relaxed"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAnalyzePastedText}
                    disabled={analyzingText || pastedText.trim().length < 30}
                    isLoading={analyzingText}
                    className="w-full gap-2 shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze Pasted Text
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Uploads History Sidebar */}
        <div className="space-y-3">
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Recent Analyzed Files
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
              {loadingHistory ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : pastUploads.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">
                  No documents analyzed yet.
                </p>
              ) : (
                pastUploads.map((up) => (
                  <button
                    key={up.id}
                    onClick={() => handleSelectPastUpload(up)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between group"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {up.filename}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {up.file_type.toUpperCase()} &bull; {formatDate(up.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      View
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ANALYSIS RESULTS SECTION (Section 12) */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-blue-600" />
                Analysis Results &mdash; {analyzedDocName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {analysisResult.detected_document_type && `Identified Type: ${analysisResult.detected_document_type}`}
                {analysisResult.detected_jurisdiction && ` &bull; Jurisdiction: ${analysisResult.detected_jurisdiction}`}
              </p>
            </div>
            <Badge variant="generated" className="text-xs">
              AI Audit Complete
            </Badge>
          </div>

          {/* 1. Plain-Language Summary */}
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/20">
            <CardHeader className="p-4 border-b border-blue-100 dark:border-blue-900">
              <CardTitle className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Plain-Language Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysisResult.summary}
            </CardContent>
          </Card>

          {/* 2. Key Clauses */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Key Clauses Detected ({analysisResult.key_clauses.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.key_clauses.map((kc, i) => {
                const badgeVariant =
                  kc.risk_level.toLowerCase() === "high"
                    ? "high"
                    : kc.risk_level.toLowerCase() === "critical"
                    ? "critical"
                    : kc.risk_level.toLowerCase() === "medium"
                    ? "medium"
                    : "low";

                return (
                  <Card key={i} className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {kc.clause_title}
                      </CardTitle>
                      <Badge variant={badgeVariant as any}>{kc.risk_level} Risk</Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2 text-xs">
                      {kc.excerpt && (
                        <blockquote className="border-l-2 border-slate-300 dark:border-slate-700 pl-2.5 italic text-slate-600 dark:text-slate-400 font-serif">
                          &quot;{kc.excerpt}&quot;
                        </blockquote>
                      )}
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {kc.analysis}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 3. Risks & Recommendations */}
          {analysisResult.risks && analysisResult.risks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Identified Operational & Legal Risks
              </h3>
              <div className="space-y-3">
                {analysisResult.risks.map((risk, i) => (
                  <Card key={i} className="border-amber-200 dark:border-amber-900 bg-amber-50/20">
                    <CardContent className="p-4 flex items-start gap-3 text-xs">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {risk.title}
                          </h4>
                          <Badge variant="medium" className="text-[10px]">
                            {risk.severity} Severity
                          </Badge>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {risk.description}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                          <strong>Action Recommendation:</strong> {risk.recommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 4. Missing Information & Questions to Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Missing Provisions */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Potentially Missing Provisions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.missing_information.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Questions to Review with Legal Counsel */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Questions to Review with Counsel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.questions_to_review.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Legal Safety Notice */}
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Legal Safety Note:</strong> Analysis results identify common risk areas and standard contract provisions. No statement should be interpreted as an official conclusion on legal enforceability. Always consult qualified legal counsel for binding determinations.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
