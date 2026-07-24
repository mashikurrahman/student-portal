import type { ApplicationStage, Role } from "@prisma/client";

/**
 * Application pipeline state machine. See docs/DATA_MODEL.md §5.
 * Transitions are validated here; PipelineService is the only caller that
 * performs them, and every transition writes an ApplicationEvent.
 */

export type Actor = "student" | "agent" | "system";

interface Transition {
  to: ApplicationStage;
  by: Actor;
}

const TRANSITIONS: Record<ApplicationStage, Transition[]> = {
  draft: [{ to: "documents_pending", by: "system" }],
  documents_pending: [{ to: "ready_for_review", by: "student" }],
  ready_for_review: [{ to: "under_agent_review", by: "agent" }],
  under_agent_review: [
    { to: "documents_pending", by: "agent" }, // re-upload requested
    { to: "submitted_to_university", by: "agent" },
  ],
  submitted_to_university: [{ to: "university_reviewing", by: "agent" }],
  university_reviewing: [
    { to: "offer_received", by: "agent" },
    { to: "rejected", by: "agent" },
  ],
  offer_received: [
    { to: "accepted", by: "student" },
    { to: "withdrawn", by: "student" },
  ],
  accepted: [{ to: "enrolled", by: "agent" }],
  rejected: [],
  withdrawn: [],
  enrolled: [],
};

/** Which actor role a request maps to for transition purposes. */
export function actorForRole(role: Role): Actor {
  if (role === "student") return "student";
  if (role === "agent") return "agent";
  return "system";
}

export function canTransition(
  from: ApplicationStage,
  to: ApplicationStage,
  actor: Actor,
): boolean {
  return TRANSITIONS[from].some((t) => t.to === to && t.by === actor);
}

export function nextStages(from: ApplicationStage): ApplicationStage[] {
  return TRANSITIONS[from].map((t) => t.to);
}

/** Terminal stages have no outgoing transitions. */
export function isTerminal(stage: ApplicationStage): boolean {
  return TRANSITIONS[stage].length === 0;
}
