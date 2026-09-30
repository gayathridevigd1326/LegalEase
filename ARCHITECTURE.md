# LEGAL EASE — SYSTEM ARCHITECTURE

> **Tagline:** Draft Smarter. Understand Better.  
> **Source of Truth Specification:** `LegalEase.pdf` (25 Pages Audited & Fully Verified)  
> **Platform:** Production-Grade AI Legal Document Generator & Intelligence SaaS

---

## 1. High-Level Architecture Overview

LegalEase is engineered with a clean, decoupled architecture separating presentation, business logic, asynchronous AI workflows, and persistence layers. It unifies the original specification requirements from `LegalEase.pdf` with an enterprise-grade full-stack SaaS platform.

```
       ┌────────────────────────┐                  ┌────────────────────────┐
       │ Next.js 14 SaaS Web UI │                  │ Streamlit Frontend UI  │
       │ (TypeScript, Tailwind, │                  │ (app.py: 3-col logo,   │
       │  Document Studio, Auth)│                  │  dark preview, editor) │
       └───────────┬────────────┘                  └───────────┬────────────┘
                   │ /api/v1/... (JWT)                         │ /generate (REST)
                   └─────────────────────┬─────────────────────┘
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │            FastAPI Backend                │
                   │ (main.py, routes.py, CORS, Rate Limit)    │
                   └─────────────┬───────────────────┬─────────┘
                                 │                   │
                ┌────────────────▼─┐               ┌─▼──────────────────────────┐
                │  Service Layer   │               │ Document Formatting Engine │
                │  - Auth Service  │               │ - sanitize_text            │
                │  - Doc Service   │               │ - format_docx (Logo, Table)│
                │  - Upload Svc    │               │ - format_pdf (Header/Foot) │
                │  - Template Svc  │               │ - format_html_preview      │
                └────────┬─────────┘               └────────────────────────────┘
                         │
         ┌───────────────┴────────────────────────┐
         ▼                                        ▼
┌──────────────────┐               ┌────────────────────────────────────┐
│   Persistence    │               │ AI Core (ai_core.gemini_generator) │
│ - PostgreSQL /   │               │ ┌────────────────────────────────┐ │
│   SQLite Engine  │               │ │   GeminiDocumentGenerator      │ │
│ - SQLAlchemy 2.0 │               │ └────────────────┬───────────────┘ │
│ - Alembic DDL    │               │                  ▼                 │
└──────────────────┘               │        Google Gemini 1.5 Pro       │
                                   │         (or Mock Fallback)         │
                                   └────────────────────────────────────┘
```

---

## 2. Directory Structure

```
LegalEase/
├── LegalEase.pdf                    # PRIMARY SPECIFICATION / SOURCE OF TRUTH (25 Pages)
├── app.py                           # Streamlit Frontend (PDF Milestone 4 & 5)
├── routes.py                        # Standalone API routes & DocumentRequest (PDF M3)
├── requirements.txt                 # Unified project dependencies (PDF M1 & 5)
├── assets/
│   └── logo.png                     # LegalEase brand logo emblem
├── ai_core/                         # AI Core Package (PDF Milestone 1 & 3)
│   ├── __init__.py
│   └── gemini_generator.py          # GeminiDocumentGenerator (gemini-1.5-pro)
├── scripts/
│   └── audit_project.py             # Automated specification audit script
├── backend/
│   ├── app/
│   │   ├── ai/                      # AI Provider abstraction & prompts
│   │   │   ├── provider_base.py     # Base abstract provider interface
│   │   │   ├── gemini_provider.py   # Production Google Gemini SDK
│   │   │   ├── mock_provider.py     # Deterministic offline mock provider
│   │   │   ├── prompt_builder.py    # Structured prompt engineering
│   │   │   ├── validator.py         # JSON extraction and schema validation
│   │   │   └── document_generator.py# Provider factory & resolution
│   │   ├── config.py                # Environment settings via Pydantic
│   │   ├── database.py              # Cross-dialect SQLAlchemy engine & GUID
│   │   ├── document/
│   │   │   ├── document_exporter.py # Export coordinator for PDF, DOCX, TXT
│   │   │   ├── formatting.py        # PDF spec formatters & sanitization
│   │   │   └── extractor.py         # Text extraction for PDF, DOCX, TXT
│   │   ├── models/                  # SQLAlchemy 2.x Declarative Models
│   │   │   ├── user.py              # Users & credentials
│   │   │   ├── document.py          # Documents & DocumentVersions
│   │   │   ├── template.py          # Legal templates & JSON schemas
│   │   │   ├── upload.py            # UploadedDocuments & AnalysisResults
│   │   │   └── generation_request.py# Asynchronous audit log
│   │   ├── routes/                  # FastAPI router endpoints
│   │   │   ├── auth.py              # Register, login, profile, me
│   │   │   ├── documents.py         # CRUD, generation, export, versions
│   │   │   ├── templates.py         # Templates catalog & schema fetch
│   │   │   ├── uploads.py           # Upload & automatic AI document audit
│   │   │   ├── ai.py                # Clause rewrite, explain, summarize
│   │   │   └── health.py            # Healthcheck & status
│   │   ├── schemas/                 # Pydantic v2 Request/Response DTOs
│   │   ├── security/                # JWT verification, passlib bcrypt, rate limiting
│   │   ├── services/                # Business logic isolating routes from DB
│   │   └── utils/                   # Structured logger & latency middleware
│   ├── migrations/                  # Alembic migration revisions
│   ├── tests/                       # 100% passing Pytest suite
│   │   ├── test_pdf_specification.py# PDF spec verification tests
│   │   ├── test_export.py           # Multi-format export tests
│   │   ├── test_ai_provider.py      # AI provider & prompt tests
│   │   ├── test_upload_analysis.py  # File upload & audit tests
│   │   ├── test_auth.py             # Authentication tests
│   │   └── test_documents.py        # Document lifecycle tests
│   ├── seed.py                      # 17-template seed script
│   └── requirements.txt             # Python backend dependencies
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with Auth & Toast providers
│   │   ├── page.tsx                 # Full SaaS marketing landing page
│   │   ├── login/page.tsx           # Authentication login
│   │   ├── register/page.tsx        # Registration with disclaimer consent
│   │   └── dashboard/
│   │       ├── layout.tsx           # Shell layout with Sidebar and Header
│   │       ├── page.tsx             # Dashboard stats and recent activity
│   │       ├── documents/page.tsx   # Document library (grid/list, filters)
│   │       ├── documents/new/page.tsx # 6-Step creation wizard
│   │       ├── documents/[id]/page.tsx # 3-column Document Studio Editor
│   │       ├── templates/page.tsx   # Template marketplace
│   │       ├── analyze/page.tsx     # Contract intelligence analyzer
│   │       └── settings/page.tsx    # User profile & theme settings
│   ├── components/                  # UI, Layout, Wizard, and Editor widgets
│   ├── lib/
│   │   ├── api.ts                   # Strongly typed unified API client
│   │   ├── auth-context.tsx         # React Auth context and useAuth hook
│   │   ├── types.ts                 # Full TypeScript contract interfaces
│   │   └── utils.ts                 # Styling & formatting utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── AUDIT_REPORT.md                  # Comprehensive specification audit report
├── CHANGELOG.md                     # Semantic version history
├── API.md                           # REST API specification
├── SECURITY.md                      # Security, rate limiting & data policy
└── README.md                        # Master project guide
```

---

## 3. Core Subsystems

### 3.1 AI Core (`ai_core` & Google Gemini 1.5 Pro)
The AI layer exposes `ai_core.gemini_generator.GeminiDocumentGenerator` leveraging `gemini-1.5-pro` for deep contextual contract reasoning. When `GEMINI_API_KEY` is configured, it sends structured prompts directly to Google Generative AI. When running offline or without credentials, it utilizes a deterministic legal fallback generator covering recitals, covenants, confidentiality, termination, and execution lines.

### 3.2 Dual Presentation Layer
1. **Streamlit Frontend (`app.py`)**: Fulfills `LegalEase.pdf` Milestones 4 and 5. Features a 3-column layout centering company logo, parameter input forms (document type, parties, semicolon-separated terms, dates), dark-themed HTML preview card, inline document editor ("Click to Edit Document"), and one-click loaders for all three PDF benchmark scenarios.
2. **Next.js 14 SaaS Platform (`frontend/`)**: Enterprise web tier featuring a 6-step dynamic creation wizard, 3-column Document Studio Editor (outline, paper view, AI assistant), revision snapshots, and contract upload intelligence.

### 3.3 Document Formatting & Export Engine
Directly implements core utility functions specified in `LegalEase.pdf`:
- `sanitize_text(text)`: Removes typographic smart quotes, dashes, non-breaking spaces, and bullet characters (`\uf0b7`).
- `format_docx(text, doc_type, terms, logo_path)`: Produces Microsoft Word `.docx` documents with Times New Roman font, front-page logo embedding, and auto-generated "Schedule A" terms table.
- `format_pdf(text, doc_type, terms, logo_path)`: Produces branded `.pdf` documents with running headers, center logos, bold headings, bullet terms, and running legal disclaimer footers on all pages.
- `format_html_preview(text)`: Renders dark-themed scrollable cards with semantic HTML.
