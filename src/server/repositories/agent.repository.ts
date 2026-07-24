import { prisma } from "@/lib/prisma";

/**
 * Agent-scoped application access. Every query is constrained to applications
 * assigned to the requesting agent — the core tenant-isolation guard for agents
 * (see docs/SECURITY.md S3). Never expose an unscoped lookup.
 */
export const agentRepository = {
  listCaseload(agentUserId: string) {
    return prisma.application.findMany({
      where: { assignedAgentUserId: agentUserId },
      orderBy: { updatedAt: "desc" },
      include: {
        student: { include: { profile: true } },
        program: { include: { university: { include: { country: true } } } },
      },
    });
  },

  findForAgent(id: string, agentUserId: string) {
    return prisma.application.findFirst({
      where: { id, assignedAgentUserId: agentUserId },
      include: {
        student: { include: { profile: true } },
        program: { include: { university: { include: { country: true } } } },
        requirementSet: { include: { requiredDocuments: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  findDocumentForAgent(documentId: string, applicationId: string, agentUserId: string) {
    return prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId,
        application: { assignedAgentUserId: agentUserId },
      },
    });
  },
};
