/**
 * Checklist service: derives the document checklist for an application from its
 * RequirementSet, honoring the two-phase model (core to apply, post_admission
 * after an offer). Pure and unit-testable (see docs/PRD.md S6, DATA_MODEL.md).
 */

export type DocPhase = "core" | "post_admission";
export type ReviewStatus = "pending" | "approved" | "rejected" | "reupload_requested";
export type ChecklistItemStatus = "missing" | ReviewStatus;

export interface RequiredDocumentInput {
  documentType: string;
  phase: DocPhase;
  required: boolean;
  notes?: string | null;
}

export interface UploadedDocumentInput {
  documentType: string;
  phase: DocPhase;
  reviewStatus: ReviewStatus;
}

export interface ChecklistItem {
  documentType: string;
  phase: DocPhase;
  required: boolean;
  notes?: string | null;
  status: ChecklistItemStatus;
}

/**
 * Builds the checklist. Post-admission items are only included once the
 * application has reached an offer/accepted state.
 */
export function buildChecklist(
  required: RequiredDocumentInput[],
  uploaded: UploadedDocumentInput[],
  options: { includePostAdmission: boolean },
): ChecklistItem[] {
  const latestByType = new Map<string, UploadedDocumentInput>();
  for (const doc of uploaded) latestByType.set(doc.documentType, doc);

  return required
    .filter((r) => r.phase === "core" || options.includePostAdmission)
    .map((r) => {
      const match = latestByType.get(r.documentType);
      return {
        documentType: r.documentType,
        phase: r.phase,
        required: r.required,
        notes: r.notes ?? null,
        status: (match ? match.reviewStatus : "missing") as ChecklistItemStatus,
      };
    });
}

/**
 * A student may submit to their agent once every REQUIRED core document has an
 * uploaded file (approval happens later, during agent review).
 */
export function isCorePhaseComplete(
  required: RequiredDocumentInput[],
  uploaded: UploadedDocumentInput[],
): boolean {
  const uploadedTypes = new Set(
    uploaded.filter((u) => u.phase === "core").map((u) => u.documentType),
  );
  return required
    .filter((r) => r.phase === "core" && r.required)
    .every((r) => uploadedTypes.has(r.documentType));
}
