import { ApiResponse, User, DocumentItem, DocumentListItem, DocumentVersion, Template, UploadResponse, DocumentAnalysisResponse } from "./types";

let rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
if (rawBase && !rawBase.endsWith("/api") && !rawBase.endsWith("/api/")) {
  rawBase = rawBase.replace(/\/+$/, "") + "/api";
}
const API_BASE_URL = rawBase.replace(/\/+$/, "");

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("legalease_token");
  }
  return null;
}

export function setToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("legalease_token", token);
    } else {
      localStorage.removeItem("legalease_token");
    }
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: res.status === 401
            ? "Invalid email or password."
            : res.status >= 500
            ? "Server is currently waking up or unavailable. Please wait a few seconds and try again."
            : text.slice(0, 150) || `Request failed with status ${res.status}`,
        },
      };
    }

    return json;
  } catch (err: any) {
    const isNetworkErr = err?.name === "TypeError" || err?.message?.toLowerCase().includes("fetch");
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: isNetworkErr
          ? "Unable to reach server. If using cloud hosting, the server may be waking up from idle (please wait 20-30s and try again)."
          : err.message || "Unable to communicate with LegalEase server.",
      },
    };
  }
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string }) =>
      request<{ access_token: string; token_type: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () =>
      request("/auth/logout", {
        method: "POST",
      }),
    getMe: () => request<User>("/auth/me"),
    updateProfile: (data: any) =>
      request<User>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  documents: {
    list: (params?: {
      search?: string;
      doc_type?: string;
      status?: string;
      jurisdiction?: string;
      sort_by?: string;
      sort_order?: string;
      page?: number;
      page_size?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.doc_type) query.append("doc_type", params.doc_type);
      if (params?.status) query.append("status", params.status);
      if (params?.jurisdiction) query.append("jurisdiction", params.jurisdiction);
      if (params?.sort_by) query.append("sort_by", params.sort_by);
      if (params?.sort_order) query.append("sort_order", params.sort_order);
      if (params?.page) query.append("page", params.page.toString());
      if (params?.page_size) query.append("page_size", params.page_size.toString());
      return request<{ items: DocumentListItem[]; total: number; page: number; pages: number }>(
        `/documents?${query.toString()}`
      );
    },
    get: (id: string) => request<DocumentItem>(`/documents/${id}`),
    create: (data: any) =>
      request<DocumentItem>("/documents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, newVersion = false) =>
      request<DocumentItem>(`/documents/${id}?new_version=${newVersion}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    generate: (data: any) =>
      request<DocumentItem>("/documents/generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    duplicate: (id: string) =>
      request<DocumentItem>(`/documents/${id}/duplicate`, {
        method: "POST",
      }),
    delete: (id: string) =>
      request(`/documents/${id}`, {
        method: "DELETE",
      }),
    getVersions: (id: string) => request<DocumentVersion[]>(`/documents/${id}/versions`),
    restoreVersion: (id: string, versionId: string) =>
      request<DocumentItem>(`/documents/${id}/versions/${versionId}/restore`, {
        method: "POST",
      }),
    getExportUrl: (id: string, format: "pdf" | "docx" | "txt") =>
      `${API_BASE_URL}/documents/${id}/export/${format}`,
  },

  templates: {
    list: (params?: { category?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append("category", params.category);
      if (params?.search) query.append("search", params.search);
      return request<Template[]>(`/templates?${query.toString()}`);
    },
    get: (id: string) => request<Template>(`/templates/${id}`),
  },

  uploads: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<UploadResponse>("/uploads", {
        method: "POST",
        body: formData,
      });
    },
    list: () => request<UploadResponse[]>("/uploads"),
    get: (id: string) => request<UploadResponse>(`/uploads/${id}`),
  },

  ai: {
    improve: (data: { text: string; instruction: string; context?: string }) =>
      request<{ original_text: string; proposed_text: string; explanation: string; changes_made?: string[] }>(
        "/ai/improve",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    explain: (data: { text: string; context?: string }) =>
      request<{
        clause_text: string;
        plain_english_explanation: string;
        key_implications: string[];
        potential_risks: string[];
        common_alternatives?: string[];
      }>("/ai/explain", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    summarize: (data: { content: string }) =>
      request<{ summary: string; key_points: string[]; parties_involved: string[]; governing_law?: string; effective_duration?: string }>(
        "/ai/summarize",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    analyzeText: (text: string) =>
      request<DocumentAnalysisResponse>("/ai/analyze-text", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
  },
};
