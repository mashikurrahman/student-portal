import { randomBytes } from "node:crypto";

/**
 * Generates a random temporary password for invited users. Shown to the inviting
 * admin once (no email delivery in the current phase). Users should rotate it on
 * first login (a "force reset" flow is a later enhancement).
 */
export function generateTempPassword(): string {
  // URL-safe base64, trimmed to a reasonable length, with guaranteed symbols.
  const raw = randomBytes(12).toString("base64").replace(/[+/=]/g, "");
  return `Tmp-${raw}9!`;
}
