import type { ApplicationStage, EligibilityResult, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Application access, always scoped to the owning student. Agent/admin-scoped
 * queries are added in Phase 2/3.
 */
export const applicationRepository = {
  listForStudent(studentUserId: string) {
    return prisma.application.findMany({
      where: { studentUserId },
      orderBy: { createdAt: "desc" },
      include: {
        program: { include: { university: { include: { country: true } } } },
      },
    });
  },

  findForStudent(id: string, studentUserId: string) {
    return prisma.application.findFirst({
      where: { id, studentUserId },
      include: {
        program: { include: { university: { include: { country: true } } } },
        requirementSet: { include: { requiredDocuments: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  create(data: {
    studentUserId: string;
    agencyId: string;
    assignedAgentUserId: string | null;
    programId: string;
    requirementSetId: string;
    intake: string;
    eligibilityResult: EligibilityResult;
  }) {
    return prisma.application.create({
      data: { ...data, stage: "documents_pending" },
    });
  },

  /**
   * Transitions an application's stage and records an ApplicationEvent in one
   * transaction (see docs/DATA_MODEL.md S5).
   */
  async transition(params: {
    id: string;
    from: ApplicationStage;
    to: ApplicationStage;
    actorUserId: string;
    note?: string;
    extra?: Prisma.ApplicationUpdateInput;
  }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: params.id },
        data: { stage: params.to, ...(params.extra ?? {}) },
      });
      await tx.applicationEvent.create({
        data: {
          applicationId: params.id,
          actorUserId: params.actorUserId,
          fromStage: params.from,
          toStage: params.to,
          note: params.note,
        },
      });
      return updated;
    });
  },
};
