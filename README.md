# LEGAL EASE

### AI-Powered Legal Document Generator & Intelligence SaaS

> **Tagline:** Draft Smarter. Understand Better.  
> **Source of Truth Specification:** `LegalEase.pdf` (All 25 Pages Audited & 100% Verified)  
> **Built for:** Founders, corporate operators, legal professionals, and modern teams.

---

## 1. Overview

**LegalEase** is a comprehensive, production-grade legal document generation and intelligence platform. It seamlessly unites two operational tiers:

1. **The Specification Baseline (`LegalEase.pdf`):**
   - Decoupled FastAPI backend with root `GET /` and `POST /generate` endpoints.
   - Google Gemini 1.5 Pro AI core (`ai_core.gemini_generator.GeminiDocumentGenerator`) with structured legal prompt engineering and resilient fallback.
   - Core formatting module (`sanitize_text`, `format_docx`, `format_pdf`, `format_html_preview`) featuring Times New Roman typography, front-page logo embedding, Schedule A terms table generation, and running page footers.
   - Interactive Streamlit frontend (`app.py`) featuring a 3-column logo layout, dark HTML preview card, inline document editor ("Click to Edit Document"), multi-format downloads (`.txt`, `.docx`, `.pdf`), and 1-click loaders for all three PDF benchmark scenarios (Employment Contract, NDA, Residential Lease).

2. **The Modern Full-Stack SaaS Extension:**
   - Next.js 14 App Router platform with Tailwind CSS, Lucide icons, and responsive desktop/mobile layout.
   - 17+ production legal templates with dynamic JSON Schema forms.
   - 3-Column Document Studio: live outline, typography-tuned canvas, and contextual AI Assistant with side-by-side diff previews and explicit Accept/Reject actions.
   - In-place autosaving, revision snapshot history, and one-click rollback.
   - Contract Intelligence Analyzer for uploaded PDF, DOCX, and TXT agreements.
   - Enterprise security: JWT auth, BCrypt password hashing, rate limiting, and structured JSON audit logging.

---

## 2. Technology Stack

### Backend & AI Core
- **Framework:** Python 3.12, FastAPI
- **AI Core:** Google Gemini SDK (`gemini-1.5-pro` via `google.generativeai`) with mock legal fallback
- **Document Formatting:** `python-docx` (Times New Roman, terms table, logo), `fpdf2`, `reportlab`, `pypdf`, `Pillow`
- **Data & ORM:** SQLAlchemy 2.x, Alembic, PostgreSQL / SQLite
- **Security:** Passlib (BCrypt), PyJWT (HS256), in-memory rate limiting
- **Logging:** Structured JSON request logging middleware

### Frontend Options
- **Streamlit Frontend (`app.py`):** Conforms strictly to `LegalEase.pdf` Milestones 4 & 5.
- **Enterprise SaaS Frontend (`frontend/`):** Next.js 14 App Router, TypeScript 5, Tailwind CSS, Lucide React.

---

## 3. Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm 9+

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/legalease.git
cd legalease

# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install all dependencies (matching LegalEase.pdf)
pip install -r requirements.txt
```

### 2. Launch FastAPI Backend
```bash
uvicorn backend.app.main:app --reload --port 8000
```
- Base status endpoint: `http://127.0.0.1:8000/`
- Spec generation endpoint: `http://127.0.0.1:8000/generate`
- Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

### 3. Option A: Launch Streamlit Frontend (`LegalEase.pdf` Spec)
```bash
streamlit run app.py
```
*Opens at `http://localhost:8501`. Features 3-column logo header, dark preview card, inline editor, multi-format export buttons, and 1-click loaders for Scenarios 1, 2, and 3.*

### 4. Option B: Launch Next.js 14 Enterprise SaaS Frontend
```bash
cd frontend
npm install
npm run dev
```
*Opens at `http://localhost:3000`. Features full authentication, template gallery, 3-column Document Studio, and contract upload intelligence.*

**Demo Credentials for SaaS Web App:**
- **Email:** `demo@legalease.io`
- **Password:** `LegalEase2026!`

---

## 4. Automated Specification Audit & Verification

To run the automated audit tool verifying compliance against all 25 pages of `LegalEase.pdf`:
```bash
python scripts/audit_project.py
```

### Run Full Test Suite
```bash
# Run specification-specific test suite
pytest backend/tests/test_pdf_specification.py -v

# Run entire backend test suite (27 tests)
pytest backend/tests -v
```

### Build Frontend Production Assets
```bash
cd frontend
npm run build
```

---

## 5. Benchmark Scenarios from `LegalEase.pdf`

| Scenario | Document Type | Key Inputs & Parameters | Verified Output |
| :--- | :--- | :--- | :--- |
| **Scenario 1** | Employment Contract | Startup founder, new hire, roles, responsibilities, compensation, confidentiality | Branded PDF with embedded logo and footer |
| **Scenario 2** | Non-Disclosure Agreement (NDA) | Freelancer, client, scope of confidentiality, 3-year term, effective date | Structured agreement with non-disclosure covenants |
| **Scenario 3** | Residential Lease Agreement | Landlord, tenant, property address, rent, deposit, terms | Formatted Word document (`.docx`) with Schedule A terms table |

---

## 6. Architecture & Documentation Directory

- **`AUDIT_REPORT.md`**: Complete specification audit report with requirement comparison matrix.
- **`CHANGELOG.md`**: Version history and log of updates.
- **`ARCHITECTURE.md`**: Complete system architecture, data models, and component flow.
- **`API.md`**: REST API endpoints, schemas, request/response examples.
- **`SECURITY.md`**: Security architecture, sanitization, rate limiting, and data privacy policies.
- **`LegalEase.pdf`**: The foundational specification document (25 pages).
