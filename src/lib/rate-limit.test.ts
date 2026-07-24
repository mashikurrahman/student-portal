import { describe, it, expect } from "vitest";
import { InMemoryRateLimiter } from "./rate-limit";

describe("InMemoryRateLimiter", () => {
  it("allows up to the limit within a window", () => {
    const rl = new InMemoryRateLimiter(() => 1000);
    expect(rl.check("k", 3, 1000).allowed).toBe(true);
    expect(rl.check("k", 3, 1000).allowed).toBe(true);
    expect(rl.check("k", 3, 1000).allowed).toBe(true);
    expect(rl.check("k", 3, 1000).allowed).toBe(false);
  });

  it("reports remaining accurately", () => {
    const rl = new InMemoryRateLimiter(() => 0);
    expect(rl.check("k", 2, 1000).remaining).toBe(1);
    expect(rl.check("k", 2, 1000).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    let now = 0;
    const rl = new InMemoryRateLimiter(() => now);
    rl.check("k", 1, 1000);
    expect(rl.check("k", 1, 1000).allowed).toBe(false);
    now = 1000; // window boundary reached
    expect(rl.check("k", 1, 1000).allowed).toBe(true);
  });

  it("isolates keys", () => {
    const rl = new InMemoryRateLimiter(() => 0);
    rl.check("a", 1, 1000);
    expect(rl.check("a", 1, 1000).allowed).toBe(false);
    expect(rl.check("b", 1, 1000).allowed).toBe(true);
  });

  it("can be manually reset (e.g. on successful login)", () => {
    const rl = new InMemoryRateLimiter(() => 0);
    rl.check("k", 1, 1000);
    rl.reset("k");
    expect(rl.check("k", 1, 1000).allowed).toBe(true);
  });

  it("sweeps expired windows", () => {
    let now = 0;
    const rl = new InMemoryRateLimiter(() => now);
    rl.check("k", 5, 1000);
    now = 2000;
    rl.sweep();
    // After sweep the key window is gone; a fresh check starts a new window.
    expect(rl.check("k", 1, 1000).remaining).toBe(0);
  });
});
