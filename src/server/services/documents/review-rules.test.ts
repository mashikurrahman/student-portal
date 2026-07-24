import { describe, it, expect } from "vitest";
import { resolveReview, actionRequiresReason } from "./review-rules";

describe("actionRequiresReason", () => {
  it("requires a reason for reject and re-upload", () => {
    expect(actionRequiresReason("reject")).toBe(true);
    expect(actionRequiresReason("request_reupload")).toBe(true);
  });
  it("does not require a reason for approve", () => {
    expect(actionRequiresReason("approve")).toBe(false);
  });
});

describe("resolveReview", () => {
  it("approves without a reason", () => {
    expect(resolveReview("approve")).toEqual({ status: "approved", reason: null });
  });

  it("rejects with a reason", () => {
    expect(resolveReview("reject", "Blurry scan")).toEqual({
      status: "rejected",
      reason: "Blurry scan",
    });
  });

  it("throws when rejecting without a reason", () => {
    expect(() => resolveReview("reject", "   ")).toThrow(/reason is required/i);
  });

  it("throws when requesting re-upload without a reason", () => {
    expect(() => resolveReview("request_reupload")).toThrow(/reason is required/i);
  });

  it("trims whitespace from the reason", () => {
    expect(resolveReview("reject", "  wrong doc  ").reason).toBe("wrong doc");
  });
});
