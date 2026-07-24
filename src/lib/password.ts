import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id password hashing (see docs/SECURITY.md §2).
 * Parameters follow OWASP recommendations for interactive logins.
 */
const OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
  return verify(hashValue, plain, OPTIONS);
}
