# Role–Permission Matrix (RBAC + ABAC)

**Status:** Draft v1 · **Date:** 2026-07-25

Authorization = **RBAC** (role → permission set) **+ ABAC** (attribute conditions that
narrow scope). Enforced server-side on every request and, for tenant data, by Postgres RLS
(ADR-001). Permissions are DB-backed so roles can be customized per organization later.

---

## 1. Permission model

A permission is `domain:action` evaluated against a **scope condition**.

- **Domains:** `crm`, `university`, `catalog`, `application`, `eligibility`, `document`,
  `workflow`, `task`, `calendar`, `message`, `notification`, `finance`, `commission`,
  `scholarship`, `report`, `analytics`, `audit`, `settings`, `billing`, `apiKey`,
  `integration`, `user`, `role`, `ai`, `impersonation`.
- **Actions:** `read`, `create`, `update`, `delete`, `approve`, `assign`, `export`,
  `configure`, `release`, `execute`.
- **Scope (ABAC) conditions:**
  - `org` — rows within the caller's organization (default for all agency staff).
  - `assigned` — only records the caller is assigned to (counsellor caseload).
  - `own` — only the caller's own records (student/parent).
  - `university` — only applications routed to the caller's university org (partner).
  - `platform` — cross-tenant (super admin / auditor only).
  - `none` — not permitted.

Example: a Counsellor has `document:read@assigned`, `application:update@assigned`; an
Agency Admin has `document:read@org`; a Super Admin has `document:read@platform`.

---

## 2. Roles → default scope

| Role | Primary scope | Notes |
|------|--------------|-------|
| **Student** | `own` | The applicant. |
| **Parent/Sponsor** | `own` (linked student, read-mostly) | Consent-gated view + finance. |
| **Counsellor** | `assigned` | Owns a caseload of students. |
| **Agent** | `assigned`→`org` | Senior counsellor; may see team caseload. |
| **Agency Admin** | `org` | Runs the agency tenant. |
| **Document Verification Officer** | `org` (documents) | Verification queue specialist. |
| **Finance Officer** | `org` (finance) | Money, invoices, payouts. |
| **Compliance Officer** | `org` (audit/compliance) | Policies, GDPR, risk. |
| **University Partner** | `university` | External; sees only their programs/applications. |
| **Support Executive** | `org` (limited) + step-up impersonation | Help desk. |
| **Super Admin** | `platform` | Platform operator (your company). |
| **Auditor** | `platform` (read-only) | Read + export everything; changes nothing. |

---

## 3. Matrix (representative — full grid generated into the DB seed)

Legend: ✅ full · 🅰 approve · 👁 read-only · ✂ scoped (see condition) · — none.
Scope shown where it narrows the default.

| Domain / Role | Stud | Par | Couns | Agent | AgAdm | DocVO | Fin | Comp | UniP | Supp | Super | Audit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| crm (students) | 👁own | 👁own | ✂assigned | ✂org | ✅org | 👁org | 👁org | 👁org | — | ✂org | ✅ | 👁 |
| university CRM | 👁 | — | 👁 | 👁 | ✂org | — | — | 👁 | ✂university | 👁 | ✅ | 👁 |
| catalog/program | 👁 | 👁 | 👁 | 👁 | 👁 | — | — | 👁 | ✂university | 👁 | ✅ | 👁 |
| application | ✂own | 👁own | ✂assigned | ✂org | ✅org | 👁 | 👁 | 👁 | ✂university | 👁 | ✅ | 👁 |
| eligibility | ✂own | 👁 | ✅assigned | ✅org | ✅org | — | — | 👁 | 👁univ | 👁 | ✅ | 👁 |
| document (view) | ✂own | 👁own(consent) | ✂assigned | ✂org | 👁org | ✅org | 👁 | 👁 | ✂university | ✂org | ✅ | 👁 |
| document (verify/approve) | — | — | 🅰assigned | 🅰org | 🅰org | ✅org | — | 👁 | — | — | ✅ | — |
| document (release to univ) | — | — | — | ✂org | ✅org | 🅰 | — | 🅰 | 👁 | — | ✅ | — |
| workflow/automation | — | — | 👁 | ✂org | ✅org | 👁 | 👁 | 👁 | — | 👁 | ✅ | 👁 |
| task | ✂own | — | ✅assigned | ✅org | ✅org | ✅org | ✅org | ✅org | ✂univ | ✅org | ✅ | 👁 |
| calendar | ✂own | 👁 | ✅assigned | ✅org | ✅org | ✅ | ✅ | ✅ | ✂univ | ✅ | ✅ | 👁 |
| messaging | ✂own | ✂own | ✅assigned | ✅org | ✅org | ✂org | ✂org | ✂org | ✂univ | ✅org | ✅ | 👁 |
| finance/invoices | 👁own | 👁own | — | 👁 | 👁org | — | ✅org | 👁 | — | — | ✅ | 👁 |
| commission | — | — | 👁own | 👁 | ✂org | — | ✅org | 👁 | — | — | ✅ | 👁 |
| scholarship | 👁 | 👁 | ✅assigned | ✅org | ✅org | — | 👁 | 👁 | ✂univ | 👁 | ✅ | 👁 |
| report | 👁own | — | 👁assigned | 👁org | ✅org | 👁 | ✅org | ✅org | ✂univ | 👁 | ✅ | ✅ |
| analytics | — | — | 👁 | 👁org | ✅org | 👁 | 👁 | ✅org | ✂univ | — | ✅ | ✅ |
| audit log | — | — | — | — | 👁org | 👁org | 👁org | ✅org | — | 👁org | ✅ | ✅ |
| settings (org) | — | — | — | ✂org | ✅org | — | ✂fin | ✂comp | ✂univ | — | ✅ | 👁 |
| billing (subscription) | — | — | — | — | ✅org | — | ✅org | 👁 | — | — | ✅ | 👁 |
| apiKey / integration | — | — | — | — | ✅org | — | — | 👁 | ✂univ | — | ✅ | 👁 |
| user/role mgmt | — | — | — | ✂assign | ✅org | — | — | 👁 | ✂univ | — | ✅ | 👁 |
| ai assistant | ✂own | — | ✅assigned | ✅org | ✅org | ✅doc | ✅fin | ✅comp | ✂univ | ✅org | ✅ | 👁 |
| impersonation | — | — | — | — | ✂org(step-up) | — | — | — | — | ✂org(step-up) | ✅(step-up) | — |

> Impersonation is always **step-up authenticated, time-boxed, banner-flagged, and audited**.
> Parent/Sponsor access to a student's data is **consent-gated** and revocable by the student.
> University Partner sees only applications explicitly routed to their organization.

---

## 4. Enforcement layers (defense in depth)

1. **Middleware** — session present + role permitted for the route group.
2. **Service/policy layer** — `authorize(user, 'document:approve', doc)` evaluates
   RBAC + ABAC condition against the specific resource (prevents IDOR).
3. **Postgres RLS** — tenant boundary enforced by the database (ADR-001).
4. **Audit** — every allow/deny on sensitive domains recorded.

## 5. Acceptance criteria (for the authorization module)

- A permission check is required at the service layer for every mutating action; a lint rule
  fails the build if a route handler mutates without an `authorize(...)` call.
- Cross-tenant access is impossible even with a forged/guessed id (verified by RLS + tests).
- Roles are data, not code: an org admin can clone a role and adjust scoped permissions
  within the platform-defined ceiling.
- 100% of the matrix cells above are covered by policy unit tests.
