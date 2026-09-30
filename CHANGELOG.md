# Changelog — LegalEase

All notable changes, fixes, and architectural reconciliations made to LegalEase are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-09-30 (Security Hardening & Final Auto-Sync)

### Fixed & Hardened
- **Direct `GET /health` Endpoint**: Added direct root health check route on FastAPI backend (`backend/app/main.py`), returning 200 OK for automated liveness probes.
- **Parentheses-Aware Party Parsing**: Enhanced `_generate_fallback` in `ai_core/gemini_generator.py` to prevent incorrect splitting when commas are nested inside party titles/company names (e.g. `David Miller (Founder / CEO, CloudScale AI)`).
- **XSS Prevention in HTML Preview**: Added HTML entity escaping (`html.escape`) across all dynamic text nodes in `format_html_preview` to protect against script injection in document previews.
- **Multi-Party Signatures**: Dynamic generation of execution lines for all identified parties in offline fallback documents.

### Verified
- **27 / 27 Pytest Test Cases Passed** across all backend test modules.
- **Scenarios 1, 2, and 3 Verified End-to-End** with live FastAPI and export generation.

---

## [1.1.0] - 2026-09-30 (Specification-Driven Audit & Update)

### Added
- **`ai_core/gemini_generator.py`**: Created the core AI generation module specified in Milestone 1 & 3 of `LegalEase.pdf`. Exposes `GeminiDocumentGenerator` leveraging Google Gemini 1.5 Pro (`gemini-1.5-pro`) with structured legal prompts and resilient offline fallback templates.
- **`ai_core/__init__.py`**: Exported `GeminiDocumentGenerator` under the `ai_core` namespace.
- **`backend/app/document/formatting.py`**: Implemented standalone core utility functions specified in Milestone 2 & 4:
  - `sanitize_text(text)`: Removes typographic smart quotes, non-breaking spaces, and bullet characters (`\uf0b7`).
  - `format_docx(text, doc_type, terms, logo_path)`: Generates DOCX with Times New Roman, front-page logo, and auto-generated "Schedule A" Terms table.
  - `format_pdf(text, doc_type, terms, logo_path)`: Generates PDF with center/running header logo, bold headings, bullet-style terms, and running legal disclaimer footer.
  - `format_html_preview(text)`: Renders dark-themed scrollable card (`#0f172a`) with semantic HTML.
- **`routes.py`**: Added root-level API router with `POST /generate` accepting `DocumentRequest(document_type, parties, terms, dates)` and export endpoints (`/format/docx`, `/format/pdf`).
- **`app.py`**: Created the Streamlit frontend application matching Milestone 4 & 5 specifications:
  - 3-column layout centering company logo (`assets/logo.png`).
  - Form fields for document type, parties, semicolon-separated terms, and effective date.
  - Sidebar demo loaders for Scenarios 1, 2, and 3 from `LegalEase.pdf`.
  - Dynamic dark HTML preview card.
  - "Click to Edit Document" inline editing interface.
  - Multi-format download buttons (`.txt`, `.docx`, `.pdf`).
- **`assets/logo.png`**: High-resolution brand logo (512x512) featuring the LegalEase scales of justice badge.
- **`requirements.txt`**: Consolidated root requirements file containing all dependencies from `LegalEase.pdf` (FastAPI, Streamlit, Uvicorn, python-docx, fpdf2, ReportLab, Pillow, requests, google-generativeai, python-dotenv).
- **`scripts/audit_project.py`**: Automated specification auditor verifying all 5 milestones and 18 compliance checkpoints.
- **`backend/tests/test_pdf_specification.py`**: 9 automated test cases covering root `/`, `POST /generate`, sanitization, DOCX formatting, PDF formatting, HTML preview, and all 3 PDF scenarios.
- **`AUDIT_REPORT.md`**: Comprehensive specification audit report with full requirement comparison matrix.

### Changed
- **`backend/app/main.py`**: Mounted root `routes.py` at both `/` and `/api/v1` prefixes so both spec-compliant callers (e.g. Streamlit `app.py`) and Next.js SaaS clients work concurrently.
- **`backend/app/document/document_exporter.py`**: Re-exported all new formatting functions (`sanitize_text`, `format_html_preview`, `format_docx`, `format_pdf`) as static methods on `DocumentExporter`.
- **Environment**: Upgraded virtual environment with `streamlit` and `fpdf2`, ensuring seamless interoperability between FastAPI and Streamlit.

### Verified
- **27 / 27 Pytest Test Cases Passed** (100% backend test suite pass).
- **Next.js 14 Production Build Clean** (`npm run build` exited with code 0 across 12 routes).
- **Zero Data Loss**: Existing SQLite/PostgreSQL schemas and data intact.

---

## [1.0.0] - 2026-09-30 (Initial Master Build)
- Full-stack SaaS application with FastAPI, Next.js 14 App Router, Tailwind CSS, Lucide icons.
- Complete document drafting, versioning, template gallery, AI clause rewrite/simplification, and file upload analysis.
- JWT authentication, password hashing with bcrypt, and structured JSON logging.
