# Study Abroad Application Portal

A three-sided web platform that helps students apply to universities in other countries, and lets partner
agencies manage and submit those applications on their behalf.

The platform is **agency-mediated**: students prepare and submit applications to an assigned agent, who
validates documents and lodges the application with the university.

---

## Personas

- **Student** — browse country → university → program, check eligibility, see the required-document
  checklist, upload documents, submit, and track status.
- **Agent / Counselor** — manage an assigned caseload, review/approve documents, download document bundles,
  advance applications through the pipeline, and submit to universities.
- **Agency Admin** — manage the agency's agents, assign students, and view reporting.
- **Super Admin** — onboard agencies and own the country/university/program/requirement catalog.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js Route Handlers + Zod validation
- **Database:** PostgreSQL + Prisma
- **Auth:** Auth.js (email/password + verification) with role-based access control
- **Storage:** S3-compatible object storage, private buckets, short-lived pre-signed URLs
- **Email:** Resend / SendGrid (transactional)
- **Testing:** Vitest (unit/integration) + Playwright (E2E), 80% coverage target

## Documentation

Full planning docs live in [`docs/`](./docs):

| Doc | What it covers |
|-----|----------------|
| [PRD.md](./docs/PRD.md) | Product requirements, personas, user stories, two-phase document model |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, RBAC matrix, folder structure, API conventions |
| [DATA_MODEL.md](./docs/DATA_MODEL.md) | Entities, Prisma schema draft, application state machine |
| [SECURITY.md](./docs/SECURITY.md) | PII/document security, threat model, compliance, checklists |
| [ROADMAP.md](./docs/ROADMAP.md) | Phased delivery plan (Phases 0–4) |
| [TASK_LIST.md](./docs/TASK_LIST.md) | Granular, checkbox task list per phase |

## Status

📋 **Planning.** No application code yet — the next step is Phase 0 (foundation) scaffolding.

## Getting Started (once scaffolded)

```bash
# Placeholder — populated in Phase 0
npm install
cp .env.example .env      # fill in DB, storage, email, auth secrets
npx prisma migrate dev
npm run dev
```
