import { describe, it, expect } from "vitest";
import { computeNextVersion } from "./requirement-version";

describe("computeNextVersion", () => {
  it("starts at 1 with no prior versions", () => {
    expect(computeNextVersion([])).toBe(1);
  });

  it("increments past the highest existing version", () => {
    expect(computeNextVersion([1, 2, 3])).toBe(4);
    expect(computeNextVersion([2, 5, 3])).toBe(6);
  });
});
