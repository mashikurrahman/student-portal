import { prisma } from "@/lib/prisma";
import { HttpError, notFound } from "@/lib/api";
import { applicationRepository } from "@/server/repositories/application.repository";
import { catalogRepository } from "@/server/repositories/catalog.repository";
import { profileRepository } from "@/server/repositories/profile.repository";
import { evaluateEligibility } from "./eligibility";
import { isCorePhaseComplete } from "./checklist";
import { notify } from "./notifications";
import type { AuthUser } from "@/server/auth/session";

/**
 * Orchestrates student-side application actions: creation (with an eligibility
 * snapshot) and submit-to-agent. Enforces pipeline guards (docs/DATA_MODEL.md S5).
 */
export const applicationService = {
  async create(user: AuthUser, requirementSetId: string) {
    if (!user.agencyId) throw new HttpError(400, "Your account is not linked to an agency.");

    const reqSet = await catalogRepository.getRequirementSet(requirementSetId);
    if (!reqSet || !reqSet.active) throw notFound("Program requirement set");

    const profile = await profileRepository.get(user.id);
    if (!profile) throw new HttpError(400, "Complete your profile before applying.");

    const report = evaluateEligibility(
      {
        educationHistory: (profile.educationHistory as never) ?? [],
        testScores: (profile.testScores as never) ?? {},
      },
      {
        minGpa: reqSet.minGpa ? Number(reqSet.minGpa) : null,
        gpaScale: reqSet.gpaScale ? Number(reqSet.gpaScale) : null,
        minIelts: reqSet.minIelts ? Number(reqSet.minIelts) : null,
        minToefl: reqSet.minToefl ? Number(reqSet.minToefl) : null,
        minPte: reqSet.minPte ? Number(reqSet.minPte) : null,
        minDuolingo: reqSet.minDuolingo ? Number(reqSet.minDuolingo) : null,
      },
    );

    // Route to the student's assigned agent, if any.
    const assignment = await prisma.assignment.findFirst({
      where: { studentUserId: user.id, agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
    });

    return applicationRepository.create({
      studentUserId: user.id,
      agencyId: user.agencyId,
      assignedAgentUserId: assignment?.agentUserId ?? null,
      programId: reqSet.programId,
      requirementSetId: reqSet.id,
      intake: reqSet.intake,
      eligibilityResult: report.result,
    });
  },

  async submitToAgent(user: AuthUser, applicationId: string) {
    const app = await applicationRepository.findForStudent(applicationId, user.id);
    if (!app) throw notFound("Application");
    if (app.stage !== "documents_pending") {
      throw new HttpError(409, "This application cannot be submitted from its current stage.");
    }

    const complete = isCorePhaseComplete(
      app.requirementSet.requiredDocuments.map((d) => ({
        documentType: d.documentType,
        phase: d.phase,
        required: d.required,
      })),
      app.documents.map((d) => ({
        documentType: d.documentType,
        phase: d.phase,
        reviewStatus: d.reviewStatus,
      })),
    );
    if (!complete) {
      throw new HttpError(422, "Upload all required documents before submitting.");
    }

    const updated = await applicationRepository.transition({
      id: app.id,
      from: "documents_pending",
      to: "ready_for_review",
      actorUserId: user.id,
      note: "Student submitted for agent review.",
      extra: { submittedToAgentAt: new Date() },
    });

    if (app.assignedAgentUserId) {
      await notify({
        userId: app.assignedAgentUserId,
        type: "application_submitted",
        payload: { applicationId: app.id },
      });
    }

    return updated;
  },
};
