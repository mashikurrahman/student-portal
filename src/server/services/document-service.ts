import type { DocPhase } from "@prisma/client";
import { HttpError, notFound } from "@/lib/api";
import { applicationRepository } from "@/server/repositories/application.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { storage } from "@/server/storage";
import { validateUploadMetadata } from "./documents/validation";
import type { AuthUser } from "@/server/auth/session";
import type { RegisterDocumentInput, UploadUrlInput } from "@/lib/validation/schemas";

const POST_ADMISSION_STAGES = new Set(["offer_received", "accepted", "enrolled"]);

/**
 * Determines a document's phase from the application's RequirementSet, and
 * guards that post-admission documents are only uploaded after an offer.
 */
async function resolvePhaseAndGuard(
  user: AuthUser,
  applicationId: string,
  documentType: string,
): Promise<{ appId: string; phase: DocPhase }> {
  const app = await applicationRepository.findForStudent(applicationId, user.id);
  if (!app) throw notFound("Application");

  const required = app.requirementSet.requiredDocuments.find(
    (d) => d.documentType === documentType,
  );
  const phase: DocPhase = required?.phase ?? "core";

  if (phase === "post_admission" && !POST_ADMISSION_STAGES.has(app.stage)) {
    throw new HttpError(409, "Post-admission documents unlock after an offer is received.");
  }
  return { appId: app.id, phase };
}

export const documentService = {
  async createUploadUrl(user: AuthUser, applicationId: string, input: UploadUrlInput) {
    const meta = validateUploadMetadata({
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
    if (!meta.ok) throw new HttpError(422, meta.error ?? "Invalid file.");

    const { appId } = await resolvePhaseAndGuard(user, applicationId, input.documentType);
    return storage.createUploadUrl({
      applicationId: appId,
      documentType: input.documentType,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });
  },

  async register(user: AuthUser, applicationId: string, input: RegisterDocumentInput) {
    const { appId, phase } = await resolvePhaseAndGuard(user, applicationId, input.documentType);
    const doc = await documentRepository.register({
      applicationId: appId,
      documentType: input.documentType,
      phase,
      storageKey: input.storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
    // TODO(Phase 4): enqueue malware scan; block review until scanStatus=clean.
    return doc;
  },
};
