# Security & Compliance — Study Abroad Application Portal

**Status:** Draft v1
**Last updated:** 2026-07-24

This system stores highly sensitive PII — passports, financial statements, transcripts. Security is a
first-class requirement, not an afterthought. Companion to [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Threat Model (what we're protecting against)

| Asset | Threat | Mitigation |
|-------|--------|-----------|
| Student documents (passport, financials) | Unauthorized access / leak | RBAC + pre-signed URLs + private buckets + audit log |
| Accounts | Credential theft, brute force | Argon2/bcrypt, rate limiting, email verification, optional MFA |
| Cross-tenant data | Agent/agency seeing others' students | Agency + assignment scoping at repository layer |
| Uploaded files | Malware, oversized/spoofed files | Malware scan, MIME/size validation, extension allowlist |
| APIs | Injection, SSRF, IDOR | Parameterized queries (Prisma), Zod validation, per-resource authz checks |

---

## 2. Authentication

- Passwords hashed with **Argon2id** (or bcrypt) — never stored or logged in plaintext.
- **Email verification** required before a student can submit.
- Sessions via signed JWT (short-lived) + refresh; `role` and `agencyId` embedded and re-validated server-side.
- Login and password-reset endpoints **rate-limited** and protected against enumeration (uniform responses).
- Optional **MFA (TOTP)** for agent/admin roles (recommended before production).
- Invitation-based onboarding for agents/admins (no open signup for privileged roles).

## 3. Authorization (RBAC + data isolation)

- Enforced **server-side on every endpoint** — the UI never determines access.
- Row-level scoping:
  - Agents may only access **assigned** students/applications/documents.
  - Agency admins may only access **their own agency's** data.
  - Super admin actions are audited.
- **IDOR prevention:** every document/application access re-checks ownership against the session, not just
  the presence of an ID in the URL.
- See the RBAC matrix in [ARCHITECTURE.md](./ARCHITECTURE.md#4-rbac-matrix).

## 4. Document Handling (the highest-risk area)

- Documents stored in a **private** S3-compatible bucket — no public read.
- Upload and download only via **short-lived pre-signed URLs** (a few minutes), issued after an authz check.
- **Malware scanning** on every upload; a document is not reviewable until `scanStatus = clean`.
- Validation on upload: allowlist of MIME types (PDF/JPG/PNG), max size, extension check, magic-byte check.
- **Every view/download is written to the AuditLog** (actor, document, IP, timestamp).
- Encryption **at rest** (bucket-level / SSE) and **in transit** (TLS everywhere).
- Versioned documents; old versions retained for audit but access-controlled identically.

## 5. Input Validation

- **Zod** schema validation at every boundary (request bodies, query params, webhooks).
- Never trust external data (client input, file contents, third-party API responses).
- Fail fast with clear, non-leaky error messages.
- Prisma parameterized queries only — no raw string-concatenated SQL.

## 6. Web Security Baseline

- **XSS:** React auto-escaping; sanitize any rich text; no `dangerouslySetInnerHTML` without sanitization.
- **CSRF:** same-site cookies + CSRF tokens on state-changing form posts.
- **Security headers:** CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options.
- **Rate limiting** on auth, upload, and messaging endpoints.
- **Secrets:** only via environment variables / secret manager; validated present at startup; never committed.
  Enforce with a pre-commit secret scanner (e.g. gitleaks).

## 7. Privacy & Compliance (GDPR-style)

- Explicit consent capture for storing/processing documents.
- Data subject rights: **export** and **deletion** flows for student data.
- Data minimization — collect only what a RequirementSet needs.
- Retention policy: define how long documents are kept post-decision; auto-purge afterward.
- Data processing agreement considerations for agencies (they are processors of student data).

## 8. Auditing & Monitoring

- **AuditLog** for all sensitive actions, especially document views/downloads and role/permission changes.
- **ApplicationEvent** timeline for every pipeline transition (actor + reason).
- Error and access logging with no PII in logs.
- Alerting on anomalies (bulk downloads, repeated auth failures).

## 9. Pre-Commit / Pre-Release Security Checklist

- [ ] No hardcoded secrets (scanner passes)
- [ ] All user inputs validated (Zod at boundaries)
- [ ] SQL injection prevented (Prisma parameterized only)
- [ ] XSS prevented (no unsanitized HTML injection)
- [ ] CSRF protection on state-changing routes
- [ ] AuthN + AuthZ verified on every new endpoint (incl. IDOR check)
- [ ] Rate limiting on sensitive endpoints
- [ ] Documents private + pre-signed URL only + scanned
- [ ] Audit log entry for new sensitive actions
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies scanned (npm audit / Snyk) — no known criticals

## 10. Incident Response

1. Contain — revoke affected pre-signed URLs/sessions, disable compromised accounts.
2. Assess scope via AuditLog.
3. Rotate any exposed secrets immediately.
4. Notify affected parties per legal obligation.
5. Post-mortem and remediate root cause across the codebase.
