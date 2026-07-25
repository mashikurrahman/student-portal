/** Maps the granular ApplicationStage enum onto an ordered set of
 *  visual milestones for the progress tracker. */

export type MilestoneState = "done" | "current" | "upcoming";

export interface Milestone {
  key: string;
  label: string;
  state: MilestoneState;
}

const MILESTONES: { key: string; label: string; stages: string[] }[] = [
  { key: "draft", label: "Draft", stages: ["draft"] },
  { key: "documents", label: "Documents", stages: ["documents_pending"] },
  {
    key: "review",
    label: "Agent review",
    stages: ["ready_for_review", "under_agent_review"],
  },
  {
    key: "submitted",
    label: "Submitted",
    stages: ["submitted_to_university", "university_reviewing"],
  },
  {
    key: "decision",
    label: "Decision",
    stages: ["offer_received", "accepted"],
  },
  { key: "enrolled", label: "Enrolled", stages: ["enrolled"] },
];

/** Stages that end the flow off the happy path. */
export const TERMINAL_STAGES: Record<string, string> = {
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Returns the ordered milestones with each marked done/current/upcoming. */
export function stageMilestones(stage: string): Milestone[] {
  const currentIndex = MILESTONES.findIndex((m) => m.stages.includes(stage));
  return MILESTONES.map((m, i) => ({
    key: m.key,
    label: m.label,
    state:
      currentIndex === -1
        ? "upcoming"
        : i < currentIndex
          ? "done"
          : i === currentIndex
            ? "current"
            : "upcoming",
  }));
}
