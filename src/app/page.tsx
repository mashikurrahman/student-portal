import Link from "next/link";

const personas = [
  {
    title: "Students",
    body: "Browse country → university → program, check eligibility, see your document checklist, and apply.",
  },
  {
    title: "Agents",
    body: "Manage your caseload, review and approve documents, download bundles, and submit to universities.",
  },
  {
    title: "Agencies",
    body: "Manage agents, assign students, and track your pipeline and conversions.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Study Abroad Application Portal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Apply to universities abroad, with your agency by your side.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Discover programs, confirm you qualify, upload the right documents, and
          track every step — while your assigned agent reviews and submits on your
          behalf.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Create a student account
          </Link>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        {personas.map((p) => (
          <div
            key={p.title}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        Phase 0 foundation · see <code>docs/</code> for the full system plan.
      </footer>
    </main>
  );
}
