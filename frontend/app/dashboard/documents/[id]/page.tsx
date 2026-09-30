"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { DocumentItem, DocumentSection, DocumentVersion, StructuredDocumentContent } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Sparkles,
  Download,
  History,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  ChevronDown,
  ArrowLeft,
  Wand2,
  HelpCircle,
  BookOpen,
  Copy,
  AlertCircle,
  Check,
  X,
  FileDown,
  FileCheck,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DocumentEditorPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor editable state
  const [docTitle, setDocTitle] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Version History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState(false);
  const [confirmRestoreModal, setConfirmRestoreModal] = useState<DocumentVersion | null>(null);

  // AI Assistant State
  const [aiSelectedText, setAiSelectedText] = useState("");
  const [aiInstruction, setAiInstruction] = useState("improve");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposedDiff, setAiProposedDiff] = useState<{
    original: string;
    proposed: string;
    explanation: string;
    targetSectionIdx: number | null;
  } | null>(null);

  // AI Explanation / Summary Drawer
  const [aiExplanationResult, setAiExplanationResult] = useState<any | null>(null);

  // Load document
  const fetchDocument = useCallback(async () => {
    setLoading(true);
    const res = await api.documents.get(id);
    if (res.success && res.data) {
      setDocument(res.data);
      setDocTitle(res.data.title);
      setJurisdiction(res.data.jurisdiction || "Not specified");

      if (res.data.content?.sections) {
        setSections(res.data.content.sections);
        if (res.data.content.sections.length > 0) {
          setActiveSectionId(res.data.content.sections[0].id || "sec-1");
        }
      }
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } else {
      toastError(res.error?.message || "Document not found.");
      router.push("/dashboard/documents");
    }
    setLoading(false);
  }, [id, router, toastError]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Debounced Autosave (Section 32)
  const triggerAutosave = (newSections: DocumentSection[], newTitle: string, newJurisdiction: string) => {
    setSaveStatus("unsaved");
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      if (!document) return;

      const updatedContent: StructuredDocumentContent = {
        title: newTitle,
        document_type: document.document_type,
        jurisdiction: newJurisdiction,
        parties: document.content?.parties || [],
        sections: newSections,
        terms: document.content?.terms || {},
        warnings: document.content?.warnings || [],
        missing_information: document.content?.missing_information || [],
        disclaimer: document.content?.disclaimer,
      };

      const res = await api.documents.update(
        id,
        {
          title: newTitle,
          jurisdiction: newJurisdiction,
          content: updatedContent,
        },
        false // in-place micro-update (autosave)
      );

      if (res.success) {
        setSaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        setSaveStatus("unsaved");
      }
    }, 1800); // 1.8s debounce
  };

  // Section handling
  const handleSectionHeadingChange = (index: number, newHeading: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], heading: newHeading };
    setSections(updated);
    triggerAutosave(updated, docTitle, jurisdiction);
  };

  const handleSectionContentChange = (index: number, newContent: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], content: newContent };
    setSections(updated);
    triggerAutosave(updated, docTitle, jurisdiction);
  };

  const handleAddSection = () => {
    const newIdx = sections.length + 1;
    const newSec: DocumentSection = {
      id: `sec-${Date.now()}`,
      heading: `${newIdx}. NEW SECTION`,
      content: "Enter specific provisions and obligations here...",
      order: newIdx,
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setActiveSectionId(newSec.id!);
    triggerAutosave(updated, docTitle, jurisdiction);
    success("New section added.");
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      toastError("Agreements require at least one section.");
      return;
    }
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
    triggerAutosave(updated, docTitle, jurisdiction);
    info("Section deleted.");
  };

  // Manual Version Save
  const handleSaveExplicitVersion = async () => {
    setSaveStatus("saving");
    const updatedContent: StructuredDocumentContent = {
      title: docTitle,
      document_type: document?.document_type || "Agreement",
      jurisdiction,
      parties: document?.content?.parties || [],
      sections,
      terms: document?.content?.terms || {},
      warnings: document?.content?.warnings || [],
      missing_information: document?.content?.missing_information || [],
      disclaimer: document?.content?.disclaimer,
    };

    const res = await api.documents.update(
      id,
      {
        title: docTitle,
        jurisdiction,
        content: updatedContent,
      },
      true // creates brand new version
    );

    if (res.success && res.data) {
      setDocument(res.data);
      setSaveStatus("saved");
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      success("New version recorded in document history.");
    } else {
      toastError(res.error?.message || "Failed to save version.");
      setSaveStatus("unsaved");
    }
  };

  // Version History Modal
  const openVersionHistory = async () => {
    setHistoryModalOpen(true);
    setLoadingVersions(true);
    const res = await api.documents.getVersions(id);
    if (res.success && res.data) {
      setVersions(res.data);
    }
    setLoadingVersions(false);
  };

  const handleConfirmRestore = async () => {
    if (!confirmRestoreModal) return;
    setRestoringVersion(true);
    const res = await api.documents.restoreVersion(id, confirmRestoreModal.id);
    setRestoringVersion(false);
    if (res.success && res.data) {
      success(`Version ${confirmRestoreModal.version_number} restored successfully!`);
      setConfirmRestoreModal(null);
      setHistoryModalOpen(false);
      fetchDocument();
    } else {
      toastError(res.error?.message || "Failed to restore version.");
    }
  };

  // AI Assistant Actions (Section 11)
  const handleAiAction = async (action: string) => {
    let targetText = aiSelectedText.trim();
    let targetSectionIdx: number | null = null;

    // If no text explicitly selected, use active section content
    if (!targetText && activeSectionId) {
      const idx = sections.findIndex((s) => s.id === activeSectionId);
      if (idx !== -1) {
        targetText = sections[idx].content;
        targetSectionIdx = idx;
      }
    }

    if (!targetText && action !== "summarize") {
      toastError("Please select a clause in the editor or click on a section to target.");
      return;
    }

    setAiLoading(true);
    setAiProposedDiff(null);
    setAiExplanationResult(null);

    try {
      if (action === "improve" || action === "simplify" || action === "formal" || action === "protective") {
        const res = await api.ai.improve({
          text: targetText,
          instruction: action,
          context: document?.document_type,
        });
        if (res.success && res.data) {
          setAiProposedDiff({
            original: targetText,
            proposed: res.data.proposed_text,
            explanation: res.data.explanation,
            targetSectionIdx,
          });
        }
      } else if (action === "explain") {
        const res = await api.ai.explain({
          text: targetText,
          context: document?.document_type,
        });
        if (res.success && res.data) {
          setAiExplanationResult(res.data);
        }
      } else if (action === "summarize") {
        const fullContent = sections.map((s) => `${s.heading}\n${s.content}`).join("\n\n");
        const res = await api.ai.summarize({ content: fullContent });
        if (res.success && res.data) {
          setAiExplanationResult({
            summary: res.data.summary,
            key_implications: res.data.key_points,
            potential_risks: [
              `Governing law: ${res.data.governing_law || jurisdiction}`,
              `Effective duration: ${res.data.effective_duration || 'As stipulated'}`,
            ],
          });
        }
      }
    } catch (err: any) {
      toastError(err.message || "AI assistant encountered an issue.");
    } finally {
      setAiLoading(false);
    }
  };

  // Accept proposed change (Section 11)
  const handleAcceptAiChange = () => {
    if (!aiProposedDiff) return;

    if (aiProposedDiff.targetSectionIdx !== null) {
      const idx = aiProposedDiff.targetSectionIdx;
      const updated = [...sections];
      updated[idx] = { ...updated[idx], content: aiProposedDiff.proposed };
      setSections(updated);
      triggerAutosave(updated, docTitle, jurisdiction);
      success("Proposed AI clause revision accepted and saved.");
    } else {
      // Find and replace in active section
      const activeIdx = sections.findIndex((s) => s.id === activeSectionId);
      if (activeIdx !== -1) {
        const currentContent = sections[activeIdx].content;
        const replaced = currentContent.replace(aiProposedDiff.original, aiProposedDiff.proposed);
        const updated = [...sections];
        updated[activeIdx] = { ...updated[activeIdx], content: replaced };
        setSections(updated);
        triggerAutosave(updated, docTitle, jurisdiction);
        success("Proposed AI clause revision accepted and saved.");
      }
    }

    setAiProposedDiff(null);
  };

  const handleRejectAiChange = () => {
    setAiProposedDiff(null);
    info("Proposed revision rejected. Original clause retained.");
  };

  // Word count computation
  const totalWords = sections
    .map((s) => s.content.split(/\s+/).filter(Boolean).length)
    .reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">Opening legal document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-slate-600">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium text-xs">
              {document?.document_type}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3 w-3" />
                  Saved at {lastSavedTime}
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-amber-500">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions: Save Version, Version History, Export */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openVersionHistory}
            className="h-8 text-xs gap-1.5"
          >
            <History className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            <Badge variant="default" className="h-4 px-1 text-[10px] ml-0.5">
              v{document?.version_count || 1}
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveExplicitVersion}
            className="h-8 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Save New Version</span>
          </Button>

          {/* Export Dropdown */}
          <div className="relative group">
            <Button variant="primary" size="sm" className="h-8 text-xs gap-1.5 shadow-sm">
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
            <div className="absolute right-0 z-30 mt-1 hidden group-hover:block w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <a
                href={api.documents.getExportUrl(id, "pdf")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FileDown className="h-3.5 w-3.5 text-rose-600" />
                Export as PDF (.pdf)
              </a>
              <a
                href={api.documents.getExportUrl(id, "docx")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                Export as Word (.docx)
              </a>
              <a
                href={api.documents.getExportUrl(id, "txt")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Export as Plain Text (.txt)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Studio Layout (Outline | Center Editor | AI Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Document Outline (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm sticky top-20">
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document Outline
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {sections.length} sections &bull; {totalWords} words
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddSection}
                title="Add Section"
                className="h-7 w-7 p-0"
              >
                <Plus className="h-4 w-4 text-blue-600" />
              </Button>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
              {sections.map((sec, idx) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id || idx}
                    onClick={() => {
                      setActiveSectionId(sec.id || null);
                      const el = typeof window !== "undefined" ? window.document.getElementById(`sec-node-${idx}`) : null;
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate pr-2">{sec.heading}</span>
                    <span className="text-[10px] text-slate-400 opacity-60 font-mono">
                      §{idx + 1}
                    </span>
                  </button>
                );
              })}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSection}
                  className="w-full text-xs gap-1.5 border-dashed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN: Document Page Editor (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="legal-paper rounded-xl p-8 sm:p-12 min-h-[850px] shadow-legal border border-slate-200 dark:border-slate-800">
            {/* Document Header Branding */}
            <div className="flex justify-between items-center text-[10px] font-sans text-slate-400 uppercase tracking-widest pb-6 border-b border-slate-100 dark:border-slate-800">
              <span>LEGAL EASE CONFIDENTIAL DRAFT</span>
              <span>{document?.document_type.toUpperCase()}</span>
            </div>

            {/* Editable Title */}
            <div className="pt-8 pb-4 text-center">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => {
                  setDocTitle(e.target.value);
                  triggerAutosave(sections, e.target.value, jurisdiction);
                }}
                className="w-full font-serif font-bold text-xl sm:text-2xl text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white uppercase tracking-tight py-1 transition-colors"
                placeholder="AGREEMENT TITLE"
              />
              <div className="flex items-center justify-center gap-4 text-xs font-sans text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  Jurisdiction:
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => {
                      setJurisdiction(e.target.value);
                      triggerAutosave(sections, docTitle, e.target.value);
                    }}
                    className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none text-slate-700 dark:text-slate-300 font-medium px-1"
                  />
                </span>
                <span>&bull;</span>
                <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            {/* Legal Safety Banner */}
            <div className="my-6 p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px] font-sans text-slate-500 italic text-center">
              Informational Draft &mdash; Review with licensed counsel prior to execution.
            </div>

            {/* Parties Preamble */}
            {document?.content?.parties && document.content.parties.length > 0 && (
              <div className="py-4 text-sm font-serif text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 leading-relaxed">
                <p>
                  THIS AGREEMENT is entered into between{" "}
                  {document.content.parties.map((p, i) => (
                    <span key={i}>
                      <strong>{p.name}</strong>
                      {p.role && <em> (&quot;{p.role}&quot;)</em>}
                      {p.company && ` representing ${p.company}`}
                      {p.address && `, located at ${p.address}`}
                      {i < document.content!.parties.length - 1 ? " and " : "."}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Sections List */}
            <div className="space-y-6 pt-6 font-serif">
              {sections.map((section, idx) => {
                const isActive = activeSectionId === section.id;
                return (
                  <div
                    key={section.id || idx}
                    id={`sec-node-${idx}`}
                    onClick={() => setActiveSectionId(section.id || null)}
                    className={`rounded-lg p-3 -mx-3 transition-colors ${
                      isActive
                        ? "bg-blue-50/40 ring-1 ring-blue-400/40 dark:bg-blue-950/20"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between group mb-1.5">
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) => handleSectionHeadingChange(idx, e.target.value)}
                        className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full mr-2"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(idx);
                        }}
                        title="Delete Section"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Textarea
                      rows={Math.max(3, section.content.split("\n").length + 1)}
                      value={section.content}
                      onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                      onSelect={(e: any) => {
                        const target = e.target;
                        const selected = target.value.substring(
                          target.selectionStart,
                          target.selectionEnd
                        );
                        if (selected.trim().length > 5) {
                          setAiSelectedText(selected);
                        }
                      }}
                      className="font-serif text-sm leading-relaxed bg-transparent border-none focus:ring-0 p-0 shadow-none text-slate-800 dark:text-slate-200 resize-y"
                    />
                  </div>
                );
              })}
            </div>

            {/* Execution / Signatures Block */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 font-serif">
              <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-white mb-4">
                Execution & Signatures
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 italic">
                IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be executed by their duly authorized representatives.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-serif">
                {document?.content?.parties?.slice(0, 2).map((p, i) => (
                  <div key={i} className="space-y-3 p-3 bg-slate-50/60 dark:bg-slate-800/40 rounded border border-slate-200/70 dark:border-slate-700">
                    <p className="font-bold">{p.name} ({p.role})</p>
                    <div className="pt-6 border-b border-slate-400 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block mb-1">Signature</span>
                    </div>
                    <div className="pt-2 border-b border-slate-400 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block mb-1">Print Name & Title</span>
                    </div>
                    <div className="pt-2 border-b border-slate-400 dark:border-slate-600">
                      <span className="text-[10px] text-slate-400 block mb-1">Date</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Assistant Panel (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm sticky top-20">
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  AI Drafting Assistant
                </CardTitle>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Targeted clause improvements, simplification, and analysis.
              </p>
            </CardHeader>

            <CardContent className="p-3.5 space-y-4 text-xs">
              {/* Quick Action Chips */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Clause Actions
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleAiAction("improve")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span>Improve wording</span>
                  </button>

                  <button
                    onClick={() => handleAiAction("simplify")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Simplify clause</span>
                  </button>

                  <button
                    onClick={() => handleAiAction("formal")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                    <span>Make formal</span>
                  </button>

                  <button
                    onClick={() => handleAiAction("protective")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>More protective</span>
                  </button>

                  <button
                    onClick={() => handleAiAction("explain")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>Explain in plain English</span>
                  </button>

                  <button
                    onClick={() => handleAiAction("summarize")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                    <span>Summarize doc</span>
                  </button>
                </div>
              </div>

              {/* Active Selection / Target Indicator */}
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Clause:
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 italic">
                  {aiSelectedText
                    ? `"${aiSelectedText}"`
                    : activeSectionId
                    ? `Active Section: ${sections.find((s) => s.id === activeSectionId)?.heading || "Selected section"}`
                    : "Click on any clause in the editor"}
                </p>
              </div>

              {aiLoading && (
                <div className="p-4 text-center rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-2 text-xs font-medium text-blue-900 dark:text-blue-300">
                    AI reasoning in progress...
                  </p>
                </div>
              )}

              {/* Proposed Revision Review (Section 11: Never modify silently, Accept / Reject) */}
              {aiProposedDiff && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3 dark:border-blue-900 dark:bg-blue-950/30 space-y-2.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-300 text-xs">
                      Proposed Revision
                    </span>
                    <Badge variant="generated" className="text-[10px]">Review</Badge>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    {aiProposedDiff.explanation}
                  </p>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800 text-xs text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto leading-relaxed">
                    {aiProposedDiff.proposed}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAcceptAiChange}
                      className="flex-1 h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectAiChange}
                      className="flex-1 h-7 text-xs gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Explanation / Summary Output */}
              {aiExplanationResult && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b pb-1.5 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {aiExplanationResult.summary ? "Document Summary" : "Plain-English Explanation"}
                    </span>
                    <button
                      onClick={() => setAiExplanationResult(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiExplanationResult.plain_english_explanation || aiExplanationResult.summary}
                  </p>

                  {aiExplanationResult.key_implications && aiExplanationResult.key_implications.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Key Points & Implications:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        {aiExplanationResult.key_implications.map((imp: string, i: number) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Version History Modal (Section 31) */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Document Version History"
        description="Every significant update generates a tracked version. You can review or restore past revisions at any time."
        maxWidth="lg"
      >
        {loadingVersions ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-xs text-slate-400">Retrieving revision history...</p>
          </div>
        ) : versions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No previous versions available yet.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {versions.map((ver) => {
              const isCurrent = ver.id === document?.current_version_id;
              return (
                <div
                  key={ver.id}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-xs transition-colors ${
                    isCurrent
                      ? "border-blue-400 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Version {ver.version_number}
                      </span>
                      {isCurrent && <Badge variant="generated">Current</Badge>}
                    </div>
                    <p className="text-slate-400 mt-0.5">
                      Created {formatDateTime(ver.created_at)}
                    </p>
                    <p className="text-slate-500 mt-1 font-serif">
                      Title: {ver.content?.title || "Untitled"} &bull; {ver.content?.sections?.length || 0} sections
                    </p>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmRestoreModal(ver)}
                      className="h-7 text-xs"
                    >
                      Restore This Version
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Confirmation Modal for Restore Version (Section 44) */}
      <Modal
        isOpen={!!confirmRestoreModal}
        onClose={() => setConfirmRestoreModal(null)}
        title="Confirm Version Restore"
        description="Are you sure you want to restore Version "
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmRestoreModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRestore}
              isLoading={restoringVersion}
            >
              Restore Version
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Restoring <strong>Version {confirmRestoreModal?.version_number}</strong> will create a new current revision based on this content. Your existing versions will remain intact in history.
        </p>
      </Modal>
    </div>
  );
}
