import { describe, it, expect } from "vitest";
import { evaluateEligibility, type RequirementInput } from "./eligibility";

const req: RequirementInput = {
  minGpa: 3.3,
  gpaScale: 4,
  minIelts: 6.5,
  minToefl: 90,
  minPte: null,
  minDuolingo: null,
};

describe("evaluateEligibility", () => {
  it("returns eligible when GPA and English clearly pass", () => {
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 3.6, gpaScale: 4, year: 2025 }],
        testScores: { ielts: 7.0 },
      },
      req,
    );
    expect(report.result).toBe("eligible");
  });

  it("normalizes GPA from a different scale", () => {
    // 8.0/10 == 3.2/4 → below 3.3 but within 5% margin → borderline
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 8.0, gpaScale: 10, year: 2025 }],
        testScores: { ielts: 7.0 },
      },
      req,
    );
    expect(report.result).toBe("borderline");
  });

  it("returns borderline when a score is just below the minimum", () => {
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 3.4, gpaScale: 4, year: 2025 }],
        testScores: { ielts: 6.0 }, // 0.5 below 6.5 → near
      },
      req,
    );
    expect(report.result).toBe("borderline");
  });

  it("returns not_eligible when a score is well below the minimum", () => {
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 3.4, gpaScale: 4, year: 2025 }],
        testScores: { ielts: 5.0 },
      },
      req,
    );
    expect(report.result).toBe("not_eligible");
  });

  it("fails when no English score is provided but one is required", () => {
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 3.8, gpaScale: 4, year: 2025 }],
        testScores: {},
      },
      req,
    );
    expect(report.result).toBe("not_eligible");
    expect(report.reasons.join(" ")).toMatch(/English test/i);
  });

  it("fails when GPA is missing entirely", () => {
    const report = evaluateEligibility(
      { educationHistory: [], testScores: { ielts: 8.0 } },
      req,
    );
    expect(report.result).toBe("not_eligible");
  });

  it("passes if any provided English test meets the bar", () => {
    const report = evaluateEligibility(
      {
        educationHistory: [{ level: "bachelor", institution: "X", gpa: 3.9, gpaScale: 4, year: 2025 }],
        testScores: { ielts: 5.0, toefl: 100 }, // toefl passes
      },
      req,
    );
    expect(report.result).toBe("eligible");
  });

  it("is eligible when no thresholds are defined", () => {
    const report = evaluateEligibility(
      { educationHistory: [], testScores: {} },
      { minGpa: null, gpaScale: null, minIelts: null, minToefl: null, minPte: null, minDuolingo: null },
    );
    expect(report.result).toBe("eligible");
  });
});
