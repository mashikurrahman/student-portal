import type { DocPhase, DocumentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Document access, scoped through the parent application. Re-uploads create a
 * new version rather than mutating an existing row (immutable history).
 */
export const documentRepository = {
  listForApplication(applicationId: string) {
    return prisma.document.findMany({
      where: { applicationId },
      orderBy: { uploadedAt: "desc" },
    });
  },

  async register(data: {
    applicationId: string;
    documentType: DocumentType;
    phase: DocPhase;
    storageKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    const priorCount = await prisma.document.count({
      where: { applicationId: data.applicationId, documentType: data.documentType },
    });
    return prisma.document.create({
      data: {
        ...data,
        version: priorCount + 1,
        scanStatus: "pending",
        reviewStatus: "pending",
      },
    });
  },
};
