import type { ApplicationStage, Prisma } from "@prisma/client";
import { HttpError, notFound } from "@/lib/api";
import { agentRepository } from "@/server/repositories/agent.repository";
import { applicationRepository } from "@/server/repositories/application.repository";
import { canTransition } from "@/server/state-machine/application";
import { notify, type NotificationType } from "./notifications";
import { writeAudit } from "./audit";
import type { AuthUser } from "@/server/auth/session";

/**
 * Agent-driven pipeline transitions. Each action is validated against the state
 * machine (docs/DATA_MODEL.md S5), records an ApplicationEvent, and notifies the
 * student where relevant.
 */
export type AgentAction =
  | "start_review"
  | "request_changes"
  | "submit_to_university"
  | "mark_university_reviewing"
  | "record_offer"
  | "record_rejection"
  | "mark_enrolled";

interface ActionSpec {
  to: ApplicationStage;
  note: string;
  requiresReference?: boolean;
  notify?: NotificationType;
}

const ACTIONS: Record<AgentAction, ActionSpec> = {
  start_review: { to: "under_agent_review", note: "Agent started review." },
  request_changes: {
    to: "documents_pending",
    note: "Agent requested document changes.",
    notify: "stage_changed",
  },
  submit_to_university: {
    to: "submitted_to_university",
    note: "Agent submitted the application to the university.",
    requiresReference: true,
    notify: "stage_changed",
  },
  mark_university_reviewing: {
    to: "university_reviewing",
    note: "University is reviewing the application.",
  },
  record_offer: {
    to: "offer_received",
    note: "Offer received from the university.",
    notify: "offer_received",
  },
  record_rejection: {
    to: "rejected",
    note: "Application was rejected by the university.",
    notify: "stage_changed",
  },
  mark_enrolled: { to: "enrolled", note: "Student enrolled." },
};

export const pipelineService = {
  async advance(
    agent: AuthUser,
    applicationId: string,
    action: AgentAction,
    opts: { reference?: string; note?: string } = {},
  ) {
    const app = await agentRepository.findForAgent(applicationId, agent.id);
    if (!app) throw notFound("Application");

    const spec = ACTIONS[action];
    if (!canTransition(app.stage, spec.to, "agent")) {
      throw new HttpError(
        409,
        `Cannot ${action.replace(/_/g, " ")} from the current stage (${app.stage}).`,
      );
    }

    const extra: Prisma.ApplicationUpdateInput = {};
    if (spec.requiresReference) {
      const ref = opts.reference?.trim();
      if (!ref) throw new HttpError(422, "A university reference is required.");
      extra.universityReference = ref;
      extra.submittedToUniversityAt = new Date();
    }
    if (action === "record_offer" || action === "record_rejection") {
      extra.decisionAt = new Date();
    }

    const updated = await applicationRepository.transition({
      id: app.id,
      from: app.stage,
      to: spec.to,
      actorUserId: agent.id,
      note: opts.note ? `${spec.note} ${opts.note}` : spec.note,
      extra,
    });

    await writeAudit({
      actorUserId: agent.id,
      action: `application.${action}`,
      resourceType: "application",
      resourceId: app.id,
      metadata: { from: app.stage, to: spec.to },
    });

    if (spec.notify) {
      await notify({
        userId: app.studentUserId,
        type: spec.notify,
        payload: { applicationId: app.id, stage: spec.to },
      });
    }

    return updated;
  },
};
