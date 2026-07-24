import { describe, it, expect } from "vitest";
import { computeReport, type ReportRow } from "./reporting";

const rows: ReportRow[] = [
  { stage: "documents_pending", assignedAgentUserId: "a1", agentEmail: "a1@x", countryName: "Canada" },
  { stage: "ready_for_review", assignedAgentUserId: "a1", agentEmail: "a1@x", countryName: "Canada" },
  { stage: "submitted_to_university", assignedAgentUserId: "a2", agentEmail: "a2@x", countryName: "UK" },
  { stage: "offer_received", assignedAgentUserId: "a2", agentEmail: "a2@x", countryName: "UK" },
  { stage: "accepted", assignedAgentUserId: "a1", agentEmail: "a1@x", countryName: "Canada" },
  { stage: "enrolled", assignedAgentUserId: null, agentEmail: null, countryName: "UK" },
];

describe("computeReport", () => {
  it("counts totals", () => {
    expect(computeReport(rows).total).toBe(6);
  });

  it("orders the funnel by pipeline stage", () => {
    const funnel = computeReport(rows).funnel.map((f) => f.stage);
    expect(funnel[0]).toBe("documents_pending");
    expect(funnel.indexOf("submitted_to_university")).toBeLessThan(funnel.indexOf("offer_received"));
  });

  it("aggregates per-agent load, excluding unassigned", () => {
    const perAgent = computeReport(rows).perAgent;
    expect(perAgent.find((a) => a.agentUserId === "a1")?.count).toBe(3);
    expect(perAgent.find((a) => a.agentUserId === "a2")?.count).toBe(2);
    expect(perAgent.some((a) => a.agentUserId === null as never)).toBe(false);
  });

  it("aggregates by country sorted desc", () => {
    const byCountry = computeReport(rows).byCountry;
    expect(byCountry[0]?.count).toBeGreaterThanOrEqual(byCountry[1]?.count ?? 0);
  });

  it("computes conversion counts and rates", () => {
    const c = computeReport(rows).conversion;
    // submitted stages: submitted_to_university, offer_received, accepted, enrolled = 4
    expect(c.submitted).toBe(4);
    // offer stages: offer_received, accepted, enrolled = 3
    expect(c.offers).toBe(3);
    // accepted stages: accepted, enrolled = 2
    expect(c.accepted).toBe(2);
    expect(c.offerRate).toBeCloseTo(0.75);
    expect(c.acceptRate).toBeCloseTo(0.67, 1);
  });

  it("handles an empty dataset without dividing by zero", () => {
    const c = computeReport([]).conversion;
    expect(c.offerRate).toBe(0);
    expect(c.acceptRate).toBe(0);
  });
});
