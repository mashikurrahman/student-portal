/**
 * Pure reporting aggregation over application rows. Kept side-effect free so it
 * is fully unit-testable; the repository fetches agency-scoped rows and hands
 * them here (see docs/PRD.md AA3).
 */

export interface ReportRow {
  stage: string;
  assignedAgentUserId: string | null;
  agentEmail: string | null;
  countryName: string;
}

export interface FunnelBucket {
  stage: string;
  count: number;
}

export interface AgentLoad {
  agentUserId: string;
  agentEmail: string;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface Report {
  total: number;
  funnel: FunnelBucket[];
  perAgent: AgentLoad[];
  byCountry: CountryCount[];
  conversion: {
    submitted: number; // reached the university (any stage at/after submission)
    offers: number; // offer_received / accepted / enrolled
    accepted: number; // accepted / enrolled
    offerRate: number; // offers / submitted
    acceptRate: number; // accepted / offers
  };
}

// Pipeline order for a stable funnel; unknown stages are appended.
const STAGE_ORDER = [
  "draft",
  "documents_pending",
  "ready_for_review",
  "under_agent_review",
  "submitted_to_university",
  "university_reviewing",
  "offer_received",
  "accepted",
  "enrolled",
  "rejected",
  "withdrawn",
];

const SUBMITTED_STAGES = new Set([
  "submitted_to_university",
  "university_reviewing",
  "offer_received",
  "accepted",
  "enrolled",
]);
const OFFER_STAGES = new Set(["offer_received", "accepted", "enrolled"]);
const ACCEPTED_STAGES = new Set(["accepted", "enrolled"]);

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

export function computeReport(rows: ReportRow[]): Report {
  const funnelMap = new Map<string, number>();
  const agentMap = new Map<string, { email: string; count: number }>();
  const countryMap = new Map<string, number>();

  let submitted = 0;
  let offers = 0;
  let accepted = 0;

  for (const row of rows) {
    funnelMap.set(row.stage, (funnelMap.get(row.stage) ?? 0) + 1);
    countryMap.set(row.countryName, (countryMap.get(row.countryName) ?? 0) + 1);

    if (row.assignedAgentUserId) {
      const existing = agentMap.get(row.assignedAgentUserId);
      agentMap.set(row.assignedAgentUserId, {
        email: row.agentEmail ?? existing?.email ?? "unknown",
        count: (existing?.count ?? 0) + 1,
      });
    }

    if (SUBMITTED_STAGES.has(row.stage)) submitted += 1;
    if (OFFER_STAGES.has(row.stage)) offers += 1;
    if (ACCEPTED_STAGES.has(row.stage)) accepted += 1;
  }

  const funnel: FunnelBucket[] = [...funnelMap.entries()]
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a.stage);
      const ib = STAGE_ORDER.indexOf(b.stage);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const perAgent: AgentLoad[] = [...agentMap.entries()]
    .map(([agentUserId, v]) => ({ agentUserId, agentEmail: v.email, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const byCountry: CountryCount[] = [...countryMap.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: rows.length,
    funnel,
    perAgent,
    byCountry,
    conversion: {
      submitted,
      offers,
      accepted,
      offerRate: rate(offers, submitted),
      acceptRate: rate(accepted, offers),
    },
  };
}
