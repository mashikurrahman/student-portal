import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/server/auth/session";
import { ROLE_HOME } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const steps = [
  {
    n: "01",
    title: "Discover programs",
    body: "Browse by country, university, and program. Filter to what fits your goals and budget.",
  },
  {
    n: "02",
    title: "Check eligibility",
    body: "Instantly see whether your grades and test scores meet each program's requirements.",
  },
  {
    n: "03",
    title: "Upload documents",
    body: "Follow a clear checklist. Your agent reviews every file and requests fixes early.",
  },
  {
    n: "04",
    title: "Track & submit",
    body: "Watch each application move stage by stage while your agent submits on your behalf.",
  },
];

const features = [
  {
    title: "Guided eligibility",
    body: "Source-backed checks against real program requirements — no guesswork.",
  },
  {
    title: "Smart document checklist",
    body: "Auto-generated per program, with live status on every required file.",
  },
  {
    title: "Progress tracking",
    body: "A clear stepper from draft to enrolled, always up to date.",
  },
  {
    title: "Deadline reminders",
    body: "Never miss an intake — upcoming due dates surface right on your dashboard.",
  },
  {
    title: "Agent collaboration",
    body: "Message your assigned agent in-app, tied to each application.",
  },
  {
    title: "Document bundles",
    body: "Agents package approved files and submit to universities in a click.",
  },
];

const personas = [
  {
    title: "Students",
    body: "Browse programs, check eligibility, complete your document checklist, and apply with confidence.",
  },
  {
    title: "Agents",
    body: "Manage your caseload, review and approve documents, download bundles, and submit to universities.",
  },
  {
    title: "Agencies",
    body: "Manage agents, assign students, and track your pipeline and conversions end to end.",
  },
];

const stats = [
  { value: "40+", label: "Programs" },
  { value: "12", label: "Universities" },
  { value: "3", label: "Countries" },
  { value: "100%", label: "Guided support" },
];

export default async function HomePage() {
  // Signed-in visitors go straight to their dashboard.
  const user = await getOptionalUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              S
            </span>
            StudyPortal
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-gradient-to-b from-brand-50 to-transparent"
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Study Abroad Application Portal
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Apply to universities abroad, with your agency by your side.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Discover programs, confirm you qualify, upload the right documents, and
              track every step — while your assigned agent reviews and submits on your
              behalf.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Create a student account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>

            {/* Stats */}
            <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <dt className="text-3xl font-bold tracking-tight text-slate-900">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                From first search to submitted application.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-sm font-bold text-brand-500">{step.n}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Everything in one place
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Built to make applying abroad simple.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-200 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personas */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                One platform, three roles
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Made for everyone in the journey.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {personas.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-slate-200 bg-white p-8"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-3xl bg-brand-600 px-8 py-14 text-center sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start your application?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-100">
                Create a free student account and let your agency guide you from search
                to submission.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                >
                  Create a student account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
              S
            </span>
            StudyPortal
          </div>
          <p>© {new Date().getFullYear()} Study Abroad Application Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
