/**
 * Rate limiting (ADR-005 / SECURITY §6). A small interface so the in-memory
 * implementation used on low-cost infra (M0) can be swapped for a Redis-backed
 * one at M2 without changing any caller.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
}

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): RateLimitResult;
  reset(key: string): void;
}

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window counter kept in process memory. Correct for a single instance;
 * at M2 the Redis adapter provides cross-instance accuracy. A clock is injected
 * for deterministic tests.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const t = this.now();
    const existing = this.windows.get(key);

    if (!existing || t >= existing.resetAt) {
      const resetAt = t + windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
  }

  reset(key: string): void {
    this.windows.delete(key);
  }

  /** Drops expired windows to bound memory (call periodically if needed). */
  sweep(): void {
    const t = this.now();
    for (const [key, w] of this.windows) {
      if (t >= w.resetAt) this.windows.delete(key);
    }
  }
}

/** Process-wide limiter for the current (single-instance) deployment. */
export const rateLimiter: RateLimiter = new InMemoryRateLimiter();

/** Named policies so limits live in one place. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts / 15 min per identity
} as const;
