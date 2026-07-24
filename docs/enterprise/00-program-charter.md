# Enterprise Program Charter — Student Recruitment SaaS

**Status:** Draft v1 · **Date:** 2026-07-25 · **Owner:** Architecture Council

This charter frames the transformation of the current MVP into a production-grade,
multi-tenant SaaS for international student recruitment. It defines *how we work*,
*how we sequence the 20 deliverables*, and *how we protect the live system*.

---

## 1. Guiding principles

1. **Evolve, don't rewrite.** The deployed Next.js + Prisma + Postgres app (auth, RBAC,
   tenant-scoped repositories, application state machine, dashboards, catalog) is the
   substrate. Every capability is additive and backward-compatible.
2. **Architect for millions, deploy for today.** Design for horizontal scale and strict
   tenant isolation now; run on cost-appropriate infra and upgrade behind stable seams.
3. **Design-first, approval-gated.** Foundational decision docs → detailed specs →
   feature-by-feature implementation. No feature merges without tests, a11y, security
   review, docs, and observability.
4. **Modular monolith → services only when justified.** Domain-Driven bounded contexts
   inside one deployable, with clean seams so a context can be extracted under real load.
5. **Every action auditable, every workflow automatable, every stage trackable.**

## 2. What already exists (reuse, don't rebuild)

| Capability | Status | Evolution |
|-----------|--------|-----------|
| Auth (Auth.js, Argon2, JWT w/ role+agency) | ✅ | + Passkeys/WebAuthn, TOTP MFA, org context |
| RBAC (`can()` + permission set) | ✅ | → RBAC **+ ABAC** conditions; DB-backed roles |
| Tenant scoping (repository layer) | ✅ | + **Postgres RLS** (defense in depth) |
| Application state machine + events | ✅ | → full 13-stage lifecycle + sub-machines + outbox |
| Repositories / services / Zod / API envelope | ✅ | → `/api/v1` versioning + OpenAPI + webhooks |
| Dashboards (student/agent/admin) | ✅ | → design system, command palette, realtime |
| Catalog + RequirementSet versioning | ✅ | → University CRM + program taxonomy |
| Audit log writer | ✅ | → immutable, hash-chained, exportable |

## 3. The 20 deliverables, sequenced into workstreams

We do not produce all 20 at once; we produce them in dependency order. Each is a real
document in `docs/enterprise/` reviewed before the code it governs.

| # | Deliverable | Workstream | Depends on | Wave |
|---|-------------|-----------|-----------|------|
| — | Program Charter (this doc) | Foundation | — | **0** |
| A | Architecture Decision Records | Foundation | forks confirmed | **0** |
| 6 | Role–Permission Matrix | Foundation | A | **0** |
| 7 | State Machines | Foundation | A | **0** |
| 1 | PRD (full product) | Product | A,6,7 | **1** |
| 2 | Information Architecture | Product | 1 | 1 |
| 5 | User Journey Maps | Product | 1 | 1 |
| 3 | ERD | Data | A | 1 |
| 4 | Database Schema (Prisma + RLS) | Data | 3 | 1 |
| 8 | API Spec (OpenAPI) | Platform | 4,6,7 | 2 |
| 10 | Backend Service Architecture | Platform | 8 | 2 |
| 11 | Folder Structure | Platform | 10 | 2 |
| 9 | Frontend Component Architecture | Experience | 2 | 2 |
| 12 | Design System | Experience | 2 | 2 |
| 13 | Testing Strategy | Quality | 10,9 | 2 |
| 14 | Security Review (threat model) | Trust | 4,8 | 2 |
| 15 | Deployment Architecture | Ops | 10 | 3 |
| 16 | Observability Plan | Ops | 10 | 3 |
| 17 | Disaster Recovery Plan | Ops | 15 | 3 |
| 18 | Feature Roadmap + milestones | Program | all above | 3 |
| 19 | ClickUp task breakdown | Program | 18 | 3 |
| 20 | Incremental implementation plan | Program | 18,19 | 3 |

**Wave 0 (this turn):** Charter, ADRs, Role–Permission Matrix, State Machines.
**Wave 1:** Product + data foundation. **Wave 2:** Platform + experience + quality.
**Wave 3:** Ops + program planning. Then **implement one feature at a time**.

## 4. Build milestones (capability, not calendar)

Estimates assume a small senior team; adjust to your reality.

| Milestone | Theme | Headline outcomes |
|-----------|-------|-------------------|
| **M0 Harden foundation** | Multi-tenancy + security | `organizationId` everywhere, RLS, MFA/passkeys, security headers, rate limiting, audit hardening, CI gates, OTel skeleton |
| **M1 CRM core** | Lead→Application | Student CRM, University CRM, lifecycle state machine, tasks, calendar, notifications |
| **M2 Documents & workflow** | Trust + automation | Real object storage + AV scan + OCR, workflow engine, missing-doc detection, verification queue |
| **M3 Money** | Finance | Finance, commission, scholarships, billing, invoices, payouts ledger |
| **M4 Intelligence** | AI | AI abstraction layer + eligibility, recommendations, SOP/CV review, fraud/risk, chat assistant |
| **M5 Platform** | Ecosystem | Public `/api/v1`, webhooks, API keys, integrations, feature flags, reporting/analytics warehouse |
| **M6 Enterprise trust** | Compliance | GDPR tooling, DR drills, SOC2 evidence, SLAs, multi-region readiness |

## 5. Definition of Done (every feature, non-negotiable)

Product thinking · user stories · acceptance criteria · edge cases · error/loading/empty
states · permission checks (RBAC+ABAC) · audit logging · tests (unit/integration/e2e,
>90% on domain logic) · accessibility (WCAG 2.2 AA) · performance budget · docs · telemetry.

## 6. Ways of working

- **TDD**, Conventional Commits, small cohesive files, composition over inheritance.
- **Trunk-based** with short-lived branches behind **feature flags**; nothing half-built
  reaches users.
- **Backward compatibility is sacred** — additive migrations, expand/contract pattern,
  API versioning, no breaking changes to the live app without a deprecation window.
- Architectural trade-offs written down (ADRs) *before* implementation.

## 7. Cost & infra reality (so nobody is surprised)

Enterprise capabilities require paid infra: managed Postgres w/ read replicas + PITR,
Redis, a worker service, object storage + AV, an OTel/logs backend, email/SMS, and AI API
spend. We keep the current low-cost deployment working throughout and switch production
infra at M2–M3 when documents/finance make it necessary. A cost model ships with
Deliverable 15 (Deployment Architecture).
