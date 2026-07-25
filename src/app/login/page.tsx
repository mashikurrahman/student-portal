"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const highlights = [
  "Guided applications with source-backed eligibility checks",
  "Clean workflow steps with clear document status",
  "Agent tools for docs, students, and QA oversight",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-between bg-slate-900 p-10 text-slate-300 md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              🛡️
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/80">
              ✦ Study abroad workspace
            </span>
          </div>
          <div>
            <p className="mb-8 text-slate-400">
              Discover programs, confirm eligibility, and keep every application
              tied to the latest agency guidance.
            </p>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-xl bg-white/5 px-4 py-3.5 text-sm text-slate-200"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sign in
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Welcome back</h1>
            </div>
            <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500">
              Secure access
            </span>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Continue  →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
            <p>Internal tool — authorized users only</p>
            <p>Contact your agency if you need access</p>
          </div>
        </div>
      </div>
    </main>
  );
}
