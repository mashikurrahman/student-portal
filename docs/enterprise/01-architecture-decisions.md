# Architecture Decision Records (ADRs)

**Status:** ✅ Accepted 2026-07-25 · **Date:** 2026-07-25

**Confirmed decisions (sign-off 2026-07-25):** ADR-001 shared-schema + RLS · evolve the
deployed app (no rewrite) · start with milestone **M0 (harden foundation)** · build on
low-cost infra now, deferring Redis/workers/AV/OTel backends to M2–M3. Where an ADR names a
paid dependency (BullMQ/Redis, ClamAV, OTel backend), M0 ships an **in-process shim behind
the same interface**, swapped for the real service at M2–M3 with no caller changes.

Each ADR states the decision, the rationale, the rejected alternatives, and the trade-off
we are consciously accepting. ADRs marked ⛳ are **forks** we want explicit confirmation on
because they reshape downstream deliverables.

---

## ADR-001 ⛳ Multi-tenancy: shared schema + Postgres Row-Level Security

**Decision.** One database, one schema. Every tenant-owned row carries `organizationId`.
Isolation enforced by **PostgreSQL RLS policies** (`USING (organization_id = current_setting('app.org_id'))`)
**and** the existing application-layer repository scoping. The app sets `app.org_id` per
request/transaction from the authenticated session.

**Why.** Defense in depth — a bug in application code cannot leak cross-tenant data because
the database itself refuses the row. Cheapest to operate at hundreds of tenants; single
migration surface; enables cross-tenant analytics for the platform operator.

**Rejected.**
- *Schema-per-tenant*: migration fan-out and connection-pool pressure become unmanageable
  at scale.
- *Database-per-tenant*: strongest isolation but ops/cost explosion; reserved as an
  **escape hatch** for a whale tenant or a data-residency requirement.

**Trade-off accepted.** RLS adds query overhead and demands rigor (every table opted-in,
every connection sets the GUC). We mitigate with a Prisma middleware/`$extends` that always
sets `app.org_id` and forbids unscoped tenant queries in review.

**Migration impact.** Rename the tenant concept from `agencyId` → `organizationId`
(an `Agency` *is* an `Organization` of type agency; universities become organizations of
type `university`). Backward-compatible via a view/alias during transition.

---

## ADR-002 ⛳ Modular monolith with DDD bounded contexts (not microservices)

**Decision.** One deployable Next.js app, internally partitioned into **bounded contexts**:
`identity`, `crm-student`, `crm-university`, `catalog`, `applications`, `documents`,
`eligibility`, `workflow`, `tasks`, `calendar`, `messaging`, `notifications`, `finance`,
`commission`, `scholarships`, `reporting`, `analytics`, `audit`, `ai`, `billing`,
`integrations`, `platform`. Contexts talk via **domain events** and typed application
services — never by reaching into each other's tables.

**Why.** Microservices at this stage buy distributed-systems pain (network, saga, deploy
matrix) without the scale to justify it. A modular monolith gives clean boundaries *and*
one deploy. Any context can be extracted to a service later because the seam already exists.

**Rejected.** Microservices-first; a big-ball-of-mud single module.

**Trade-off.** Discipline required to keep contexts from importing each other's internals;
enforced with lint boundaries (e.g., `eslint-plugin-boundaries`) and a review rule.

---

## ADR-003 Event-driven core via the transactional outbox

**Decision.** State changes emit **domain events** written to an `outbox` table *in the same
transaction* as the state change. A relay publishes them to a queue (**BullMQ on Redis**);
handlers do async work (notifications, OCR, AI, projections, webhooks). At-least-once
delivery; handlers are **idempotent** (keyed by event id).

**Why.** Guarantees no lost events without 2-phase commit; decouples side effects from the
request path; gives us automation, projections, and webhooks from one mechanism.

**Rejected.** Direct in-request side effects (fragile, slow, non-retryable); Kafka
(operationally heavy for current scale — revisit at M5).

**Trade-off.** Eventual consistency for projections; we design UIs for it (optimistic
updates + reconcile).

---

## ADR-004 CQRS selectively (read models for dashboards & reporting)

**Decision.** Writes go through domain services against the normalized model. **Reads for
heavy screens** (pipeline boards, reporting, analytics) come from **denormalized read models
/ materialized views** kept current by event handlers. Simple CRUD reads stay direct.

**Why.** Recruitment dashboards aggregate across many tables for many tenants; querying the
write model per request won't scale. CQRS *everywhere* is over-engineering.

**Trade-off.** Read models can lag; acceptable for analytics, surfaced with "updated Xs ago".

---

## ADR-005 ⛳ Identity: Auth.js + Passkeys (WebAuthn) + TOTP MFA, org-aware sessions

**Decision.** Keep Auth.js. Add **passkeys/WebAuthn** as the primary strong factor and
**TOTP MFA** as fallback; step-up auth for sensitive actions (finance, document release,
impersonation). Session carries `userId`, `organizationId`, `roles[]`, and a resolved
**permission set + ABAC claims**. Support **user↔organization membership** (a counsellor may
belong to one org; a super admin to none; a university partner to a university org).

**Why.** Passkeys are phishing-resistant and the modern enterprise bar; step-up limits blast
radius; membership model enables partners and multi-org staff.

**Rejected.** Password-only; rolling our own crypto.

**Trade-off.** WebAuthn adds device-management UX; we ship recovery codes and admin reset.

---

## ADR-006 Documents: private object storage + presigned URLs + async AV + OCR

**Decision.** S3-compatible (Cloudflare R2 / AWS S3), **private buckets**, short-lived
presigned upload/download. On upload → outbox event → **AV scan (ClamAV/managed)** →
**OCR** (extract fields) → **AI missing-doc/fraud checks**. A document is not
"review-ready" until `scan=clean`. Encryption at rest (SSE) + in transit (TLS). Every view
/download audited.

**Why.** Never stream bytes through the app; never trust uploads; make verification
automated and evidence-based.

**Trade-off.** Async pipeline means a brief "scanning…" state; modeled explicitly in the UI.

---

## ADR-007 ⛳ AI via a provider-abstraction layer (ports & adapters)

**Decision.** All AI features depend on an internal **`ai` port** (`complete`, `embed`,
`extract`, `classify`, `score`) with swappable adapters (default: latest Claude; pluggable
others). **PII is redacted/tokenized before egress**; calls run as **background jobs** with
per-tenant **cost budgets, rate limits, caching, and full audit** of prompt/response
metadata. Outputs are **advisory** and always human-overridable (eligibility, fraud, risk).

**Why.** No vendor lock-in; privacy by design; cost control; models change fast — the app
shouldn't. Advisory-only keeps a human accountable for consequential decisions.

**Rejected.** Hard-coding one SDK across features; sending raw PII to third parties;
letting AI auto-decide admissions/visa outcomes.

**Trade-off.** An abstraction layer is slightly more code; worth it for portability + safety.

---

## ADR-008 API: versioned REST + OpenAPI-from-Zod + webhooks + org-scoped API keys

**Decision.** Public surface under **`/api/v1`**. Request/response schemas are **Zod**,
from which we **generate OpenAPI 3.1**. External integrators use **org-scoped API keys**
(hashed, least-privilege scopes) and receive **signed webhooks** (HMAC, ret+DLQ). Internal
app uses the same service layer.

**Why.** One source of truth (Zod) for validation + docs + types; versioning protects
integrators; webhooks make us a platform.

**Trade-off.** GraphQL deferred — REST+OpenAPI is simpler to secure and cache now.

---

## ADR-009 Observability: OpenTelemetry (traces/metrics/logs) + immutable audit

**Decision.** Instrument with **OpenTelemetry**; export to a backend (Grafana Tempo/Loki/
Mimir or Honeycomb/Datadog). **Structured JSON logs** with correlation + tenant id (never
PII). **Audit trail is a separate, append-only, hash-chained store** — compliance evidence,
not debug logs. RED/USE dashboards + SLOs with alerting.

**Trade-off.** Telemetry backend is a paid dependency; introduced at M0 as a skeleton,
scaled at M3.

---

## ADR-010 Deployment: containerized, 12-factor, managed data plane

**Decision.** Dockerized app + **separate worker** process (queue consumers). Managed
Postgres (Neon/RDS) with **PITR + read replicas**, managed Redis, object storage, secrets
manager. IaC-described; GitHub Actions CI/CD with migration gates (expand/contract).

**Trade-off.** More moving parts than a single web service; introduced when documents/finance
(M2–M3) require durability and async throughput. The current Render deploy remains valid
until then.

---

## Decision log summary

| ADR | Decision | Fork? |
|-----|----------|:----:|
| 001 | Shared schema + RLS multi-tenancy | ⛳ |
| 002 | Modular monolith + DDD contexts | ⛳ |
| 003 | Outbox + BullMQ event-driven | |
| 004 | Selective CQRS read models | |
| 005 | Passkeys + TOTP MFA, org-aware sessions | ⛳ |
| 006 | Private storage + AV + OCR pipeline | |
| 007 | AI provider-abstraction, advisory-only, PII-redacted | ⛳ |
| 008 | Versioned REST + OpenAPI + webhooks | |
| 009 | OpenTelemetry + immutable audit | |
| 010 | Containerized + managed data plane | |
