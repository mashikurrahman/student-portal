import { describe, it, expect } from "vitest";
import {
  buildChecklist,
  isCorePhaseComplete,
  type RequiredDocumentInput,
  type UploadedDocumentInput,
} from "./checklist";

const required: RequiredDocumentInput[] = [
  { documentType: "transcript", phase: "core", required: true },
  { documentType: "english_test", phase: "core", required: true },
  { documentType: "cv", phase: "core", required: false },
  { documentType: "financial_proof", phase: "post_admission", required: true },
];

describe("buildChecklist", () => {
  it("includes only core items before an offer", () => {
    const items = buildChecklist(required, [], { includePostAdmission: false });
    expect(items).toHaveLength(3);
    expect(items.every((i) => i.phase === "core")).toBe(true);
    expect(items.every((i) => i.status === "missing")).toBe(true);
  });

  it("includes post-admission items after an offer", () => {
    const items = buildChecklist(required, [], { includePostAdmission: true });
    expect(items).toHaveLength(4);
    expect(items.some((i) => i.documentType === "financial_proof")).toBe(true);
  });

  it("reflects the latest uploaded document status", () => {
    const uploaded: UploadedDocumentInput[] = [
      { documentType: "transcript", phase: "core", reviewStatus: "approved" },
      { documentType: "english_test", phase: "core", reviewStatus: "rejected" },
    ];
    const items = buildChecklist(required, uploaded, { includePostAdmission: false });
    expect(items.find((i) => i.documentType === "transcript")?.status).toBe("approved");
    expect(items.find((i) => i.documentType === "english_test")?.status).toBe("rejected");
    expect(items.find((i) => i.documentType === "cv")?.status).toBe("missing");
  });
});

describe("isCorePhaseComplete", () => {
  it("is false when a required core doc is missing", () => {
    const uploaded: UploadedDocumentInput[] = [
      { documentType: "transcript", phase: "core", reviewStatus: "pending" },
    ];
    expect(isCorePhaseComplete(required, uploaded)).toBe(false);
  });

  it("is true when all required core docs are uploaded (optional ones ignored)", () => {
    const uploaded: UploadedDocumentInput[] = [
      { documentType: "transcript", phase: "core", reviewStatus: "pending" },
      { documentType: "english_test", phase: "core", reviewStatus: "pending" },
    ];
    expect(isCorePhaseComplete(required, uploaded)).toBe(true);
  });
});
