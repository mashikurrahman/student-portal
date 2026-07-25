/** Deadline helpers for surfacing application due dates in the UI. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Stages where the application deadline is still actionable. */
const ACTIVE_STAGES = new Set([
  "draft",
  "documents_pending",
  "ready_for_review",
  "under_agent_review",
]);

export type DeadlineUrgency = "overdue" | "soon" | "upcoming" | "later";

export interface DeadlineInfo {
  date: Date;
  daysLeft: number;
  urgency: DeadlineUrgency;
  label: string;
}

/**
 * Computes days remaining and an urgency band for a deadline, or null when the
 * stage no longer cares about it or no deadline is set.
 */
export function deadlineInfo(
  deadline: Date | null | undefined,
  stage: string,
  now: Date = new Date(),
): DeadlineInfo | null {
  if (!deadline || !ACTIVE_STAGES.has(stage)) return null;

  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS);
  let urgency: DeadlineUrgency;
  let label: string;

  if (daysLeft < 0) {
    urgency = "overdue";
    label = `Overdue by ${Math.abs(daysLeft)}d`;
  } else if (daysLeft === 0) {
    urgency = "soon";
    label = "Due today";
  } else if (daysLeft <= 7) {
    urgency = "soon";
    label = `Due in ${daysLeft}d`;
  } else if (daysLeft <= 30) {
    urgency = "upcoming";
    label = `Due in ${daysLeft}d`;
  } else {
    urgency = "later";
    label = `Due ${deadline.toLocaleDateString()}`;
  }

  return { date: deadline, daysLeft, urgency, label };
}

export function deadlineTone(
  urgency: DeadlineUrgency,
): "red" | "amber" | "blue" | "neutral" {
  if (urgency === "overdue") return "red";
  if (urgency === "soon") return "amber";
  if (urgency === "upcoming") return "blue";
  return "neutral";
}
