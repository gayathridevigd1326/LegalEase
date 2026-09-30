"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DocumentListItem, Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  FilePlus,
  ScanSearch,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  Copy,
  Trash2,
  ExternalLink,
  Download,
  MoreVertical,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecentDocuments = async () => {
    setLoadingDocs(true);
    const res = await api.documents.list({ page: 1, page_size: 6, sort_by: "updated_at", sort_order: "desc" });
    if (res.success && res.data) {
      setDocuments(res.data.items);
      setTotalCount(res.data.total);
    }
    setLoadingDocs(false);
  };

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const handleDuplicate = async (docId: string) => {
    const res = await api.documents.duplicate(docId);
    if (res.success) {
      success("Document duplicated successfully.");
      fetchRecentDocuments();
    } else {
      toastError(res.error?.message || "Failed to duplicate document.");
    }
    setActiveMenuId(null);
  };

  const confirmDelete = (doc: DocumentListItem) => {
    setDocToDelete(doc);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const executeDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    const res = await api.documents.delete(docToDelete.id);
    setDeleting(false);
    if (res.success) {
      success("Document deleted.");
      setDeleteModalOpen(false);
      setDocToDelete(null);
      fetchRecentDocuments();
    } else {
      toastError(res.error?.message || "Failed to delete document.");
    }
  };

  // Compute stat metrics
  const draftsCount = documents.filter((d) => d.status === "DRAFT").length;
  const completedCount = documents.filter((d) => d.status === "GENERATED" || d.status === "FINAL" || d.status === "EDITED").length;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.full_name ? user.full_name.split(" ")[0] : "there"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Draft, review, analyze, and manage your legal contracts with AI assistance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/analyze">
            <Button variant="outline" size="sm" className="gap-2">
              <ScanSearch className="h-4 w-4 text-blue-600" />
              Analyze File
            </Button>
          </Link>
          <Link href="/dashboard/documents/new">
            <Button variant="primary" size="sm" className="gap-2 shadow-sm">
              <FilePlus className="h-4 w-4" />
              Create Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/dashboard/documents/new" className="group">
          <Card className="h-full border-blue-100 hover:border-blue-400 transition-all hover:shadow-md dark:border-blue-950 dark:hover:border-blue-800">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <FilePlus className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Create Document</CardTitle>
              <p className="text-xs text-slate-500 leading-relaxed">
                Step-by-step wizard tailored with party roles, dynamic terms, and AI drafting.
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/analyze" className="group">
          <Card className="h-full border-indigo-100 hover:border-indigo-400 transition-all hover:shadow-md dark:border-indigo-950 dark:hover:border-indigo-800">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Analyze Document</CardTitle>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload existing PDF, DOCX, or TXT contracts for instant plain-language risk analysis.
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/templates" className="group">
          <Card className="h-full border-slate-200 hover:border-slate-400 transition-all hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Browse Templates</CardTitle>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore 17+ commercial, employment, NDAs, lease, and custom legal templates.
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Documents</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Drafts</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{draftsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">AI Generated & Final</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Templates Ready</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">17 Built-in</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Documents Table Section */}
      <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Documents</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Documents you have drafted, edited, or reviewed.</p>
          </div>
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All ({totalCount}) &rarr;
            </Button>
          </Link>
        </CardHeader>

        {loadingDocs ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-xs text-slate-400">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No documents yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first AI-drafted contract or uploading an existing document for analysis.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/dashboard/documents/new">
                <Button size="sm" className="gap-1.5">
                  <FilePlus className="h-4 w-4" />
                  Create First Document
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Name & Title</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => {
                  const statusVariant =
                    doc.status === "FINAL"
                      ? "final"
                      : doc.status === "GENERATED"
                      ? "generated"
                      : doc.status === "EDITED"
                      ? "edited"
                      : "draft";

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
                        <Link
                          href={`/dashboard/documents/${doc.id}`}
                          className="hover:text-blue-600 flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {doc.document_type}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {doc.jurisdiction || "Not specified"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusVariant}>{doc.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(doc.updated_at)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="relative inline-block text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/documents/${doc.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Open
                              </Button>
                            </Link>

                            <button
                              onClick={() =>
                                setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
                              }
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>

                          {activeMenuId === doc.id && (
                            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                              <Link
                                href={`/dashboard/documents/${doc.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Edit Document
                              </Link>
                              <button
                                onClick={() => handleDuplicate(doc.id)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Duplicate
                              </button>
                              <a
                                href={api.documents.getExportUrl(doc.id, "pdf")}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download PDF
                              </a>
                              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                              <button
                                onClick={() => confirmDelete(doc)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? This action cannot be undone."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={executeDelete} isLoading={deleting}>
              Delete Document
            </Button>
          </>
        }
      >
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {docToDelete?.title}
          </p>
          <p className="text-slate-500 mt-0.5">
            Type: {docToDelete?.document_type} &bull; Status: {docToDelete?.status}
          </p>
        </div>
      </Modal>
    </div>
  );
}
