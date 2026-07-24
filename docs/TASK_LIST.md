# Task List — Study Abroad Application Portal

**Status:** Draft v1
**Last updated:** 2026-07-24

Granular, checkbox tasks per phase. Aligned with [ROADMAP.md](./ROADMAP.md). Each coding task implies:
write test (RED) → implement (GREEN) → refactor → review.

---

## Phase 0 — Foundation

### Project setup
- [ ] Init Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- [ ] ESLint + Prettier + strict tsconfig
- [ ] Vitest (unit/integration) + Playwright (E2E) configured
- [ ] `.env.example`; env validation at startup
- [ ] CI pipeline: lint, typecheck, test, secret scan (gitleaks), `npm audit`

### Database
- [ ] Add Prisma + Postgres; connection config
- [ ] Model all entities (User, StudentProfile, Agency, Country, University, Program, RequirementSet, RequiredDocument, Assignment, Application, Document, Message, ApplicationEvent, Notification, Commission, AuditLog)
- [ ] First migration
- [ ] Seed script (countries, universities, programs, RequirementSets, demo users per role)

### Auth & RBAC
- [ ] Auth.js email/password + email verification
- [ ] Session carries `userId`, `role`, `agencyId`
- [ ] RBAC middleware + role guards per route
- [ ] Repository base with agency/assignment scoping
- [ ] Password hashing (Argon2), rate limiting on auth

### Platform primitives
- [ ] API response envelope helper
- [ ] Zod validation utilities + error handler
- [ ] Object storage client + pre-signed URL issuance (upload/download)
- [ ] AuditLog writer utility

---

## Phase 1 — Student Experience
- [ ] Catalog browse UI + endpoints (country → university → program → intake) with pagination/filter
- [ ] Student profile builder (education history, test scores, budget, intake)
- [ ] `EligibilityService`: compare profile vs. RequirementSet → eligible/borderline/not_eligible + reasons
- [ ] Create Application (snapshots RequirementSet) + generate Phase A checklist
- [ ] Document upload flow: request pre-signed URL → client upload → register Document → enqueue scan
- [ ] Upload validation (MIME allowlist, size, magic bytes)
- [ ] Checklist UI with per-document status
- [ ] Submit-to-agent transition (guard: Phase A uploaded)
- [ ] Status timeline view
- [ ] Notification skeleton (email + in-app) on submit
- [ ] Tests: eligibility rules, checklist generation, upload authz, submit guard

---

## Phase 2 — Agent Experience
- [ ] Caseload dashboard (assigned students, grouped by stage, filter/sort)
- [ ] Application detail view (profile, checklist, documents, timeline, messages)
- [ ] Document review actions: approve / reject (reason) / request re-upload (reason)
- [ ] Re-upload creates new Document version → back to pending
- [ ] `PipelineService` state machine + transition guards
- [ ] Submit-to-university (set reference, timestamp)
- [ ] Record outcome (offer/rejection) → stage update
- [ ] Bundle download: stream zip of approved documents (audited)
- [ ] Messaging thread per application
- [ ] Tests: transition guards, assignment scoping (IDOR), review reason enforcement, bundle authz

---

## Phase 3 — Admin & Catalog
- [ ] Agency Admin: invite/disable agents (own agency only)
- [ ] Assign / reassign students to agents
- [ ] Reporting: pipeline funnel, per-agent load, conversion by country/university
- [ ] Commission records CRUD (manual)
- [ ] Super Admin: onboard agencies, invite agency admins
- [ ] Catalog CRUD: countries, universities, programs, intakes
- [ ] RequirementSet editor (versioned; RequiredDocument rows with phase)
- [ ] Global audit log viewer with filters
- [ ] Tests: agency isolation, catalog versioning, reporting aggregates

---

## Phase 4 — Hardening & Launch
- [ ] Malware scanner integrated end-to-end (block review until clean)
- [ ] Audit log on every document view/download
- [ ] Security headers (CSP, HSTS, etc.), CSRF, rate limiting hardened
- [ ] MFA (TOTP) for agent/admin roles
- [ ] Accessibility pass (WCAG AA) + responsive QA
- [ ] Performance: indexes, pagination everywhere, caching hot catalog reads
- [ ] E2E suite for student + agent critical paths
- [ ] Upload load/perf test
- [ ] GDPR: consent capture, data export, deletion, retention auto-purge
- [ ] Deploy runbook + staging → production promotion
- [ ] Full security review sign-off

---

## Definition of Done (every task)
- [ ] Tests written first and passing; coverage ≥ 80% for touched code
- [ ] Code review (and security review for auth/data/upload changes) passed
- [ ] No hardcoded secrets; inputs validated; errors handled
- [ ] Files focused (<800 lines), functions small (<50 lines), no unmentioned mutation
