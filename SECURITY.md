# LEGAL EASE — SECURITY & SAFETY PROTOCOLS

## 1. Security Architecture Principles

LegalEase is designed with defence-in-depth security principles for processing sensitive legal drafts, party names, and commercial parameters.

---

## 2. Authentication & Credential Protection

- **Password Hashing:** Passwords are cryptographically hashed using `bcrypt` via Passlib with automatic salt generation before persistence. Plaintext passwords are never logged, cached, or returned in API responses.
- **JWT Architecture:** Stateless tokens are signed using standard HMAC-SHA256 (`HS256`) with a configurable secret (`JWT_SECRET`) and default 24-hour expiration (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`).
- **OAuth-Ready:** User schemas and token validation layers decouple credentials from the user identity model, allowing Google/GitHub OAuth providers to be plugged in seamlessly.

---

## 3. API & Transport Security

- **CORS Restrictions:** Cross-Origin Resource Sharing is strictly governed via `CORS_ORIGINS`. In production, wildcard origins are forbidden.
- **Rate Limiting:** In-memory sliding-window token bucket algorithms protect sensitive endpoints:
  - AI Document Generation & Rewrites: 20 requests/minute/IP
  - Authentication (Login/Register): 30 requests/minute/IP
- **Unified Error Normalization:** Uncaught exceptions are caught by central exception handlers. Database tracebacks and internal stack traces are suppressed from client responses, preventing internal schema reconnaissance.

---

## 4. File Upload Security (PDF / DOCX / TXT)

For the Document Intelligence Analyzer:
1. **Extension Whitelist:** Only `.pdf`, `.docx`, and `.txt` extensions are accepted. Executables, scripts, and archives (`.exe`, `.sh`, `.zip`, `.js`) are rejected with HTTP 400.
2. **Payload Size Restrictions:** File uploads are restricted to a maximum of 15MB (`UPLOAD_MAX_SIZE_MB=15`). Streaming chunks monitor total bytes transferred and abort early on violation (HTTP 413).
3. **Filename Sanitization:** Filenames are sanitized using strict alphanumeric and symbol whitelisting (`re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)`), with UUID prefixes preventing directory traversal or path manipulation attacks (`../`).
4. **Non-Execution Sandbox:** Uploaded documents are stored outside the public web root and are never executed.

---

## 5. Privacy & AI Model Isolation

- **Zero Training Policy:** User prompts and draft contract content are not retained for model training.
- **Structured Redaction:** Prompts only inject party names and terms required to draft the requested agreement clauses.
- **Mock Mode:** Developers can run the entire platform in full mock mode (`MOCK_AI=true`) without external API calls or outbound network transmission.

---

## 6. Legal Safety & Non-Deceptive AI Guidance

- **Prominent Disclaimers:** All exported documents (PDF footers, DOCX headers, TXT banners, and web previews) feature the mandatory legal disclaimer:
  > *"LegalEase provides AI-generated legal information and document drafts for informational purposes only. It does not provide legal advice and does not replace review by a qualified legal professional. Laws and requirements vary by jurisdiction."*
- **No Fabricated Citations:** Prompts instruct the LLM explicitly against fabricating case law citations, judicial precedents, or regulatory numbers.
- **Non-Destructive AI Revisions:** The AI Assistant never silently edits active documents. All proposed clause changes must be reviewed and explicitly accepted or rejected by the user.
