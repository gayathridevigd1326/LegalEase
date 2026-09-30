# LEGAL EASE — API SPECIFICATION

This document details the REST API specification for **LegalEase — AI-Powered Legal Document Generator**.

- **Base URL:** `http://localhost:8000/api`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## Unified Response Format

All responses follow a consistent envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Human-friendly success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-friendly error explanation",
    "details": null
  }
}
```

---

## Specification Endpoints (Direct & Unauthenticated per LegalEase.pdf)

### 1. Health & Service Check
`GET /`

**Response (200 OK):**
```json
{
  "service": "LegalEase API",
  "tagline": "Draft Smarter. Understand Better.",
  "documentation": "/docs",
  "status": "online"
}
```

### 2. Legal Document Generation
`POST /generate`

**Request Body (`DocumentRequest`):**
```json
{
  "document_type": "Employment Contract",
  "parties": "John Doe (Employee), Apex Innovations Ltd. (Employer)",
  "terms": "Full-time position; $140,000 annual salary; 30 days termination notice",
  "dates": "May 1, 2025",
  "jurisdiction": "California"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "document_type": "Employment Contract",
  "parties": "John Doe (Employee), Apex Innovations Ltd. (Employer)",
  "terms": "Full-time position; $140,000 annual salary; 30 days termination notice",
  "dates": "May 1, 2025",
  "jurisdiction": "California",
  "generated_text": "EMPLOYMENT CONTRACT\n\nTHIS AGREEMENT...",
  "content": "EMPLOYMENT CONTRACT\n\nTHIS AGREEMENT...",
  "preview_html": "<div class=\"legalease-preview-container\">...</div>"
}
```

### 3. Direct Multi-Format Export
- `POST /format/docx`: Generates `.docx` with logo, Times New Roman, and terms table.
- `POST /format/pdf`: Generates `.pdf` with logo, running header, and footer.

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "Eleanor Vance"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1...",
    "token_type": "bearer",
    "user": {
      "id": "e6a1a8c3-424a-4318-9730-802ba6fa4bfb",
      "email": "user@example.com",
      "full_name": "Eleanor Vance",
      "is_active": true,
      "created_at": "2026-09-30T14:00:00Z"
    }
  },
  "message": "Account created successfully."
}
```

### 2. Login User
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "demo@legalease.app",
  "password": "password123"
}
```

### 3. Current User Profile
`GET /api/auth/me`  
*Header:* `Authorization: Bearer <token>`

### 4. Update Profile & Password
`PUT /api/auth/profile`  
*Header:* `Authorization: Bearer <token>`

---

## Document Endpoints

### 1. Create Blank or Draft Document
`POST /api/documents`  
*Header:* `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Advisory Agreement",
  "document_type": "Consulting Agreement",
  "jurisdiction": "Delaware, United States",
  "content": { ... }
}
```

### 2. List User Documents
`GET /api/documents?search=&doc_type=&status=&page=1&page_size=50`  
*Header:* `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (optional): Filter title, type, jurisdiction
- `doc_type` (optional): Filter by document type
- `status` (optional): `DRAFT`, `GENERATED`, `EDITED`, `FINAL`
- `sort_by`: `updated_at`, `created_at`, `title`
- `sort_order`: `desc`, `asc`
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 50)

### 3. Generate Contract via AI
`POST /api/documents/generate`  
*Header:* `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "document_type": "Employment Contract",
  "title": "Senior AI Architect Employment Agreement",
  "jurisdiction": "California, United States",
  "parties": [
    {
      "name": "Nova Software Inc.",
      "role": "Employer",
      "company": "Nova Software",
      "address": "100 Market St, San Francisco, CA"
    },
    {
      "name": "Alex Morgan",
      "role": "Employee",
      "email": "alex@example.com"
    }
  ],
  "terms": {
    "job_title": "Senior AI Architect",
    "salary": "$175,000 / year",
    "start_date": "2026-10-15",
    "probation": "90 days"
  },
  "additional_instructions": "Ensure full IP assignment upon creation and 30-day reciprocal termination notice."
}
```

### 4. Get Document Details
`GET /api/documents/{id}`  
*Header:* `Authorization: Bearer <token>`

### 5. Update Document & Autosave
`PUT /api/documents/{id}?new_version=false`  
*Header:* `Authorization: Bearer <token>`  
- `new_version=false`: Micro-update (debounced autosave, updates in-place)
- `new_version=true`: Creates a new snapshot version in DocumentVersion history

### 6. Duplicate Document
`POST /api/documents/{id}/duplicate`  
*Header:* `Authorization: Bearer <token>`

### 7. Delete Document
`DELETE /api/documents/{id}`  
*Header:* `Authorization: Bearer <token>`

### 8. Document Version History
`GET /api/documents/{id}/versions`  
*Header:* `Authorization: Bearer <token>`

### 9. Restore Previous Version
`POST /api/documents/{id}/versions/{version_id}/restore`  
*Header:* `Authorization: Bearer <token>`

### 10. Multi-Format Export
`GET /api/documents/{id}/export/{format}`  
*Formats:* `pdf`, `docx`, `txt`

---

## AI Assistant Endpoints

### 1. Improve Clause
`POST /api/ai/improve`  
*Header:* `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Neither party will talk about secret stuff to outsiders.",
  "instruction": "formal",
  "context": "Non-Disclosure Agreement"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "original_text": "Neither party will talk about secret stuff to outsiders.",
    "proposed_text": "The parties hereto expressly covenant and agree that all proprietary materials...",
    "explanation": "Elevated tone to formal standard contractual phrasing with customary legal warranties.",
    "changes_made": [
      "Added formal covenant language",
      "Enforced strict performance standard"
    ]
  }
}
```

### 2. Explain Clause in Plain English
`POST /api/ai/explain`  
*Header:* `Authorization: Bearer <token>`

### 3. Summarize Contract
`POST /api/ai/summarize`  
*Header:* `Authorization: Bearer <token>`

### 4. Analyze Raw Contract Text
`POST /api/ai/analyze-text`  
*Header:* `Authorization: Bearer <token>`

---

## Document Uploads & Intelligence

### 1. Upload File & Run Instant Legal Audit
`POST /api/uploads`  
*Header:* `Authorization: Bearer <token>`  
*Content-Type:* `multipart/form-data`  
*Supported Formats:* PDF, Word DOCX, Plain Text TXT (up to 15MB)

**Response:**
Returns file metadata and structured `DocumentAnalysisResponse` (summary, key_clauses, risks, missing_information, questions_to_review).

### 2. List Uploaded Files
`GET /api/uploads`  
*Header:* `Authorization: Bearer <token>`

---

## Template Endpoints

### 1. List Built-In Legal Templates
`GET /api/templates?category=Employment&search=contract`

### 2. Get Template Schema
`GET /api/templates/{id}`

---

## Health Check

### Health Status
`GET /api/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "LegalEase API",
    "environment": "development",
    "mock_ai": true,
    "model": "mock-provider",
    "timestamp": "2026-09-30T14:15:00Z"
  },
  "message": "Service is operating normally."
}
```
