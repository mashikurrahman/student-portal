# Product Requirements Document — Study Abroad Application Portal

**Status:** Draft v1
**Last updated:** 2026-07-24
**Owner:** Product

---

## 1. Vision

A three-sided web platform that lets **students** discover foreign universities, check whether they
qualify, assemble the right documents, and apply — while **agents** at partner agencies manage those
applications end-to-end and submit them to universities, and **admins** manage the catalog, people, and
reporting.

The product is **agency-mediated**: students do not submit directly to universities. They submit to their
assigned agent, who validates documents and lodges the application with the institution. This mirrors the
proven ApplyBoard model and is the core commercial relationship of the business.

## 2. Goals

- Let a student go from "which country?" to a submitted, agent-validated application without leaving the portal.
- Give agents a **pipeline**, not a folder: caseload, document review, status transitions, and bundle download.
- Model **requirements as structured data** so eligibility checks and document checklists are automatic, not manual.
- Keep sensitive documents (passports, financials, transcripts) safe and auditable.

## 3. Non-Goals (v1)

- Direct student-to-university submission (everything routes through an agent).
- Payment/commission processing (tracked as data in v1; automated payouts are later).
- AI visa-approval scoring, chatbots, or ML document checks (future phase).
- Native mobile apps (responsive web only in v1).

## 4. Success Metrics

| Metric | Target |
|--------|--------|
| Student completion rate (start → submitted) | > 60% |
| Median agent time to first document review | < 24h |
| Applications with a complete, valid document set at submission | > 90% |
| Document security incidents | 0 |

---

## 5. Personas

### 5.1 Student
Prospective international student. Wants clarity on where they qualify and exactly what to submit.

- **Needs:** clear eligibility, a precise checklist, simple uploads, honest status.
- **Pain today:** conflicting requirement info, unclear what's needed when, no visibility after applying.

### 5.2 Agent / Counselor
Employee of an agency who manages a caseload of assigned students.

- **Needs:** a queue of work, fast document review (approve/reject/request re-upload), one-click bundle download, ability to advance an application and message the student.
- **Pain today:** documents scattered across email/WhatsApp, no single source of truth, no audit trail.

### 5.3 Agency Admin
Manager at an agency. Runs the agency's people and sees performance.

- **Needs:** create/manage agents, assign students to agents, view pipeline reporting, manage commission records.

### 5.4 Super Admin (Platform)
Platform operator. Owns global data and onboarding.

- **Needs:** onboard agencies, own the country/university/program/requirement catalog, view audit logs and platform health.

---

## 6. The Two-Phase Document Model

Requirements arrive in two stages so students are never over-asked early. This is a deliberate design
decision grounded in how real university admissions work.

**Phase A — Core Application Set** (required to submit):
- Academic transcripts / diploma
- English proficiency (IELTS / TOEFL / PTE / Duolingo)
- Passport (bio page)
- Statement of Purpose (SOP)
- Recommendation letter(s)
- CV / résumé (program-dependent)

**Phase B — Post-Admission Set** (required only after an offer):
- Financial proof (bank statements, sponsor letter)
- Visa / study-permit paperwork (e.g. I-20, CAS)
- Medical / insurance documents
- Accommodation confirmation

The exact list per application is derived from the program's **RequirementSet** — it is not hardcoded.

---

## 7. Application Pipeline (shared status model)

```
Draft
  → Documents Pending        (checklist incomplete)
  → Ready for Review         (student submitted to agent)
  → Under Agent Review       (agent validating docs)
  → Submitted to University  (agent lodged it)
  → University Reviewing
  → Offer Received           (unlocks Phase B docs)
  → Accepted / Rejected / Withdrawn
  → Enrolled
```

Every transition is recorded in the audit log with actor, timestamp, and reason.

---

## 8. Feature Requirements by Persona

### 8.1 Student

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| S1 | Register & verify email | User can sign up, verify via emailed link, and log in. |
| S2 | Build profile | Capture education history, test scores, budget, target intake. Saved and editable. |
| S3 | Browse catalog | Filter by country → university → program → intake. |
| S4 | Eligibility check | System compares profile vs. RequirementSet and shows Eligible / Borderline / Not Eligible with reasons. |
| S5 | Dynamic checklist | Application shows exactly the Phase A documents required for that program. |
| S6 | Upload documents | Upload per checklist item; see status (pending/approved/rejected + reason); re-upload. |
| S7 | Submit to agent | Only allowed when Phase A checklist is complete; moves app to *Ready for Review*. |
| S8 | Track status | Timeline view of pipeline stages with timestamps. |
| S9 | Respond to offer | Accept/decline offer; on accept, Phase B checklist unlocks. |
| S10 | Messaging | Thread with assigned agent per application. |
| S11 | Notifications | Email + in-app on status change and document decisions. |

### 8.2 Agent

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| A1 | Caseload dashboard | See only assigned students; applications grouped by stage; sort/filter. |
| A2 | Application detail | See profile, checklist, all documents, timeline, messages. |
| A3 | Document review | Approve / reject (with reason) / request re-upload per document. |
| A4 | Bundle download | Download all approved documents for an application as a zip. |
| A5 | Advance stage | Move application through valid transitions (guarded by state machine). |
| A6 | Submit to university | Mark as *Submitted to University* with reference/notes. |
| A7 | Messaging | Reply to student threads. |
| A8 | Record outcome | Log offer/rejection and update stage. |

### 8.3 Agency Admin

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AA1 | Manage agents | Invite, deactivate, and edit agents within own agency only. |
| AA2 | Assign students | Assign/reassign students to agents. |
| AA3 | Reporting | Pipeline funnel, per-agent load, conversion by country/university. |
| AA4 | Commission records | View/edit commission entries per closed application (manual in v1). |

### 8.4 Super Admin

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| SA1 | Onboard agencies | Create agencies, invite agency admins. |
| SA2 | Manage catalog | CRUD countries, universities, programs, intakes. |
| SA3 | Manage RequirementSets | Define academic thresholds, required tests/scores, required document types, deadlines, fees; versioned. |
| SA4 | Audit & health | View global audit log and platform metrics. |

---

## 9. Key User Flows

### 9.1 Student happy path
Register → verify → build profile → browse & pick program → eligibility check → view Phase A checklist →
upload documents → submit to agent → track status → (offer) accept → upload Phase B docs → enrolled.

### 9.2 Agent happy path
Login → caseload → open *Ready for Review* application → review each document (approve/reject) → download
bundle → submit to university → record offer → message student.

### 9.3 Assignment flow
Student registers under an agency (via agency link/code) → Agency Admin (or auto-rule) assigns student to an
agent → agent sees them in caseload.

---

## 10. Open Questions / Future

- Multi-agency marketplace vs. single-agency deployments per customer?
- Commission automation and invoicing.
- AI-assisted document validation and visa scoring (post-MVP).
- University-side portal (fourth side) for institutions to receive applications directly.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [DATA_MODEL.md](./DATA_MODEL.md), [SECURITY.md](./SECURITY.md), and [ROADMAP.md](./ROADMAP.md).
