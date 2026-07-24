/**
 * Eligibility service: compares a student's profile against a program's
 * RequirementSet and returns eligible / borderline / not_eligible with reasons.
 * Pure and side-effect free so it is fully unit-testable (see docs/PRD.md S4).
 */

export type EligibilityResult = "eligible" | "borderline" | "not_eligible";

export interface EducationEntry {
  level: string;
  institution: string;
  gpa: number;
  gpaScale: number;
  year: number;
}

export interface TestScores {
  ielts?: number;
  toefl?: number;
  pte?: number;
  duolingo?: number;
  gre?: number;
  gmat?: number;
}

export interface ProfileInput {
  educationHistory: EducationEntry[];
  testScores: TestScores;
}

export interface RequirementInput {
  minGpa: number | null;
  gpaScale: number | null;
  minIelts: number | null;
  minToefl: number | null;
  minPte: number | null;
  minDuolingo: number | null;
}

type CriterionStatus = "pass" | "near" | "fail";

export interface EligibilityReport {
  result: EligibilityResult;
  reasons: string[];
}

// "Near" margins, expressed in each metric's native units.
const GPA_MARGIN_RATIO = 0.05; // 5% of the scale
const IELTS_MARGIN = 0.5;
const TOEFL_MARGIN = 5;
const PTE_MARGIN = 3;
const DUOLINGO_MARGIN = 5;

function classify(value: number, min: number, margin: number): CriterionStatus {
  if (value >= min) return "pass";
  if (value >= min - margin) return "near";
  return "fail";
}

/** Normalizes a GPA to a target scale (e.g. 3.6/4 → 3.6 on a 4.0 requirement). */
function normalizeGpa(gpa: number, fromScale: number, toScale: number): number {
  if (fromScale <= 0) return 0;
  return (gpa / fromScale) * toScale;
}

function bestGpa(history: EducationEntry[], targetScale: number): number | null {
  const normalized = history
    .filter((e) => typeof e.gpa === "number" && typeof e.gpaScale === "number")
    .map((e) => normalizeGpa(e.gpa, e.gpaScale, targetScale));
  if (normalized.length === 0) return null;
  return Math.max(...normalized);
}

export function evaluateEligibility(
  profile: ProfileInput,
  req: RequirementInput,
): EligibilityReport {
  const statuses: CriterionStatus[] = [];
  const reasons: string[] = [];

  // --- GPA ---
  if (req.minGpa !== null) {
    const scale = req.gpaScale ?? 4;
    const studentGpa = bestGpa(profile.educationHistory, scale);
    if (studentGpa === null) {
      statuses.push("fail");
      reasons.push("No academic GPA on file to compare against the requirement.");
    } else {
      const margin = scale * GPA_MARGIN_RATIO;
      const status = classify(studentGpa, req.minGpa, margin);
      statuses.push(status);
      if (status === "pass") {
        reasons.push(`GPA ${studentGpa.toFixed(2)}/${scale} meets the minimum ${req.minGpa}.`);
      } else if (status === "near") {
        reasons.push(`GPA ${studentGpa.toFixed(2)}/${scale} is just below the minimum ${req.minGpa}.`);
      } else {
        reasons.push(`GPA ${studentGpa.toFixed(2)}/${scale} is below the minimum ${req.minGpa}.`);
      }
    }
  }

  // --- English proficiency (student needs to satisfy at least one required test) ---
  const english: { label: string; min: number; score?: number; margin: number }[] = [
    { label: "IELTS", min: req.minIelts ?? NaN, score: profile.testScores.ielts, margin: IELTS_MARGIN },
    { label: "TOEFL", min: req.minToefl ?? NaN, score: profile.testScores.toefl, margin: TOEFL_MARGIN },
    { label: "PTE", min: req.minPte ?? NaN, score: profile.testScores.pte, margin: PTE_MARGIN },
    { label: "Duolingo", min: req.minDuolingo ?? NaN, score: profile.testScores.duolingo, margin: DUOLINGO_MARGIN },
  ].filter((e) => !Number.isNaN(e.min));

  if (english.length > 0) {
    const provided = english.filter((e) => typeof e.score === "number");
    if (provided.length === 0) {
      statuses.push("fail");
      reasons.push("No accepted English test score provided.");
    } else {
      // Best status across the tests the student actually took.
      let best: CriterionStatus = "fail";
      for (const e of provided) {
        const status = classify(e.score as number, e.min, e.margin);
        if (status === "pass") {
          best = "pass";
          reasons.push(`${e.label} ${e.score} meets the minimum ${e.min}.`);
        } else if (status === "near") {
          if (best !== "pass") best = "near";
          reasons.push(`${e.label} ${e.score} is just below the minimum ${e.min}.`);
        } else {
          reasons.push(`${e.label} ${e.score} is below the minimum ${e.min}.`);
        }
      }
      statuses.push(best);
    }
  }

  // --- Aggregate ---
  let result: EligibilityResult = "eligible";
  if (statuses.includes("fail")) result = "not_eligible";
  else if (statuses.includes("near")) result = "borderline";
  if (statuses.length === 0) reasons.push("No academic or language thresholds defined for this program.");

  return { result, reasons };
}
