import { describe, it, expect } from "vitest";
import {
  canTransition,
  nextStages,
  isTerminal,
  actorForRole,
} from "./application";

describe("application state machine", () => {
  it("lets an agent move ready_for_review → under_agent_review", () => {
    expect(canTransition("ready_for_review", "under_agent_review", "agent")).toBe(true);
  });

  it("forbids a student from starting agent review", () => {
    expect(canTransition("ready_for_review", "under_agent_review", "student")).toBe(false);
  });

  it("lets an agent request changes back to documents_pending", () => {
    expect(canTransition("under_agent_review", "documents_pending", "agent")).toBe(true);
  });

  it("lets an agent submit to university", () => {
    expect(canTransition("under_agent_review", "submitted_to_university", "agent")).toBe(true);
  });

  it("only the student may accept an offer", () => {
    expect(canTransition("offer_received", "accepted", "student")).toBe(true);
    expect(canTransition("offer_received", "accepted", "agent")).toBe(false);
  });

  it("rejects an illegal jump", () => {
    expect(canTransition("draft", "enrolled", "agent")).toBe(false);
  });

  it("reports terminal stages", () => {
    expect(isTerminal("enrolled")).toBe(true);
    expect(isTerminal("rejected")).toBe(true);
    expect(isTerminal("draft")).toBe(false);
  });

  it("lists next stages", () => {
    expect(nextStages("university_reviewing")).toEqual(
      expect.arrayContaining(["offer_received", "rejected"]),
    );
  });

  it("maps roles to actors", () => {
    expect(actorForRole("student")).toBe("student");
    expect(actorForRole("agent")).toBe("agent");
    expect(actorForRole("agency_admin")).toBe("system");
  });
});
