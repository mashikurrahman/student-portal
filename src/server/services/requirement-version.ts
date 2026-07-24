/**
 * Pure helper for RequirementSet versioning. When a super-admin edits a
 * program+intake's requirements, a NEW version supersedes the prior ones rather
 * than mutating history (immutability — see docs/DATA_MODEL.md §7).
 */
export function computeNextVersion(existingVersions: number[]): number {
  if (existingVersions.length === 0) return 1;
  return Math.max(...existingVersions) + 1;
}
