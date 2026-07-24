# Roadmap — Study Abroad Application Portal

**Status:** Draft v1
**Last updated:** 2026-07-24

Phased delivery. Every feature follows TDD (tests first) with an 80% coverage target and a code-review +
security-review gate before merge. See [TASK_LIST.md](./TASK_LIST.md) for granular tasks.

---

## Phase 0 — Foundation
**Goal:** a running skeleton with auth, RBAC, schema, and CI.

- Next.js + TypeScript + Tailwind + shadcn/ui project scaffold
- Prisma + PostgreSQL, full schema & first migration
- Auth.js: email/password, verification, session with `role` + `agencyId`
- RBAC middleware + repository-layer scoping
- API response envelope, Zod validation utilities, error handling
- Object storage integration + pre-signed URL issuance
- CI: lint, typecheck, tests, secret scan
- Seed data: 2–3 countries, several universities/programs, RequirementSets

## Phase 1 — Student Experience
**Goal:** a student can go from browse to submitted application.

- Catalog browse (country → university → program → intake)
- Student profile builder
- Eligibility check service (profile vs. RequirementSet)
- Dynamic Phase A checklist generation
- Document upload (pre-signed, validated, scanned)
- Submit-to-agent transition
- Status timeline view
- Email + in-app notifications (skeleton)

## Phase 2 — Agent Experience
**Goal:** an agent can manage a caseload and lodge applications.

- Caseload dashboard (assigned students, grouped by stage)
- Application detail (profile, checklist, docs, timeline)
- Document review: approve / reject / request re-upload (with reasons)
- Bundle download (zip of approved documents)
- Pipeline transitions (state-machine guarded)
- Submit-to-university + record outcome
- Agent ↔ student messaging

## Phase 3 — Admin & Catalog
**Goal:** agencies and the catalog are self-manageable.

- Agency Admin: manage agents, assign/reassign students
- Reporting: pipeline funnel, per-agent load, conversion
- Commission records (manual)
- Super Admin: onboard agencies, manage catalog + RequirementSets (versioned)
- Global audit log viewer

## Phase 4 — Hardening & Launch
**Goal:** production-ready.

- Malware scanning wired end-to-end
- Full audit logging of document access
- Security headers, rate limiting, MFA for privileged roles
- Accessibility (WCAG AA) + responsive polish
- Performance: query indexes, pagination, caching
- E2E test suite for critical flows; load test uploads
- GDPR flows: consent, data export, deletion, retention purge
- Staging → production deploy runbook

---

## Cross-Cutting (every phase)
- Tests first; 80%+ coverage (unit + integration + E2E).
- Code review + security review before merge.
- Small, focused files (200–400 lines); immutable domain updates.
- Conventional commits.

## Suggested Sequencing Notes
- Phases 0–2 deliver the core commercial loop (student applies → agent submits) — the first demoable product.
- Phase 3 makes it operable without engineering intervention.
- Phase 4 is the gate to real user PII in production.
