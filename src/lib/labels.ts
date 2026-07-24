/** Human-readable labels for enums shown in the UI. */

export const STAGE_LABELS: Record<string, string> = {
  draft: "Draft",
  documents_pending: "Documents pending",
  ready_for_review: "Ready for review",
  under_agent_review: "Under agent review",
  submitted_to_university: "Submitted to university",
  university_reviewing: "University reviewing",
  offer_received: "Offer received",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  enrolled: "Enrolled",
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  transcript: "Academic transcript",
  diploma: "Diploma",
  english_test: "English test score",
  passport: "Passport",
  sop: "Statement of purpose",
  recommendation_letter: "Recommendation letter",
  cv: "CV / résumé",
  financial_proof: "Financial proof",
  sponsor_letter: "Sponsor letter",
  visa_document: "Visa document",
  medical: "Medical certificate",
  insurance: "Insurance",
  accommodation: "Accommodation confirmation",
  other: "Other document",
};

export const ELIGIBILITY_LABELS: Record<string, string> = {
  eligible: "Eligible",
  borderline: "Borderline",
  not_eligible: "Not eligible",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

export function docTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] ?? type;
}
