/**
 * Pure rules for agent document review. Reject and re-upload requests MUST carry
 * a reason so the student knows what to fix (see docs/PRD.md A3).
 */
import type { ReviewStatus } from "../checklist";

export type ReviewAction = "approve" | "reject" | "request_reupload";

const ACTION_TO_STATUS: Record<ReviewAction, ReviewStatus> = {
  approve: "approved",
  reject: "rejected",
  request_reupload: "reupload_requested",
};

export function actionRequiresReason(action: ReviewAction): boolean {
  return action === "reject" || action === "request_reupload";
}

export interface ReviewDecision {
  status: ReviewStatus;
  reason: string | null;
}

/**
 * Resolves a review action into the persisted status + reason, or throws a
 * validation Error if a reason is required but missing/blank.
 */
export function resolveReview(action: ReviewAction, reason?: string | null): ReviewDecision {
  const trimmed = reason?.trim() ?? "";
  if (actionRequiresReason(action) && trimmed.length === 0) {
    throw new Error("A reason is required when rejecting or requesting a re-upload.");
  }
  return {
    status: ACTION_TO_STATUS[action],
    reason: trimmed.length > 0 ? trimmed : null,
  };
}
