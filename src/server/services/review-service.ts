import { prisma } from "@/lib/prisma";
import { HttpError, notFound } from "@/lib/api";
import { agentRepository } from "@/server/repositories/agent.repository";
import { resolveReview, type ReviewAction } from "./documents/review-rules";
import { notify } from "./notifications";
import { writeAudit } from "./audit";
import type { AuthUser } from "@/server/auth/session";

/**
 * Agent document review. Enforces assignment scoping, valid stage, and the
 * reason requirement for reject / re-upload (see docs/PRD.md A3).
 */
export const reviewService = {
  async review(
    agent: AuthUser,
    applicationId: string,
    documentId: string,
    action: ReviewAction,
    reason: string | undefined,
  ) {
    const app = await agentRepository.findForAgent(applicationId, agent.id);
    if (!app) throw notFound("Application");
    if (app.stage !== "under_agent_review") {
      throw new HttpError(409, "Start reviewing this application before deciding on documents.");
    }

    const doc = await agentRepository.findDocumentForAgent(documentId, applicationId, agent.id);
    if (!doc) throw notFound("Document");

    const decision = resolveReview(action, reason); // throws on missing reason

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        reviewStatus: decision.status,
        reviewReason: decision.reason,
        reviewedByUserId: agent.id,
        reviewedAt: new Date(),
      },
    });

    await writeAudit({
      actorUserId: agent.id,
      action: `document.${action}`,
      resourceType: "document",
      resourceId: doc.id,
      metadata: { applicationId },
    });

    await notify({
      userId: app.studentUserId,
      type: "document_reviewed",
      payload: { applicationId, documentType: doc.documentType, status: decision.status },
    });

    return updated;
  },
};
