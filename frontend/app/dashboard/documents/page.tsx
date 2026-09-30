"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { DocumentListItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  MoreVertical,
  ExternalLink,
  Copy,
  Download,
  Trash2,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

function DocumentLibraryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Action Menu & Delete
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await api.documents.list({
      search: search || undefined,
      doc_type: selectedType || undefined,
      status: selectedStatus || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
      page_size: 50,
    });

    if (res.success && res.data) {
      setDocuments(res.data.items);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedType, selectedStatus, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleDuplicate = async (docId: string) => {
    const res = await api.documents.duplicate(docId);
    if (res.success) {
      success("Document duplicated.");
      fetchDocuments();
    } else {
      toastError(res.error?.message || "Could not duplicate document.");
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
      fetchDocuments();
    } else {
      toastError(res.error?.message || "Failed to delete.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage, edit, export, and duplicate all your legal contracts ({total}).
          </p>
        </div>
        <Link href="/dashboard/documents/new">
          <Button size="sm" className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Create Document
          </Button>
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, jurisdiction, or type..."
            className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="GENERATED">Generated</option>
            <option value="EDITED">Edited</option>
            <option value="FINAL">Final</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="updated_at">Recently Updated</option>
            <option value="created_at">Date Created</option>
            <option value="title">Document Title</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-xs text-slate-400">Loading your documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No matching documents found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedStatus
              ? "Try adjusting your search filters or terms."
              : "You haven't created any documents yet. Begin drafting your first agreement."}
          </p>
          <div className="mt-5">
            <Link href="/dashboard/documents/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Draft New Document
              </Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <Card
                key={doc.id}
                className="group relative flex flex-col justify-between border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all dark:border-slate-800 dark:hover:border-blue-800"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={statusVariant}>{doc.status}</Badge>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
                        }
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuId === doc.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <Link
                            href={`/dashboard/documents/${doc.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open Editor
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
                  </div>

                  <Link href={`/dashboard/documents/${doc.id}`} className="block mt-3">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {doc.document_type}
                    </p>
                  </Link>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{doc.jurisdiction || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Updated {formatDate(doc.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {doc.id.slice(0, 8)}</span>
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700">
                      Open &rarr;
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-6 text-right">Actions</th>
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
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
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
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/documents/${doc.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              Open
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleDuplicate(doc.id)}
                            title="Duplicate"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(doc)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? All associated versions will also be removed."
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
          <p className="font-semibold text-slate-800 dark:text-slate-200">{docToDelete?.title}</p>
          <p className="text-slate-500 mt-0.5">
            Type: {docToDelete?.document_type} &bull; Status: {docToDelete?.status}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function DocumentLibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    }>
      <DocumentLibraryContent />
    </Suspense>
  );
}
