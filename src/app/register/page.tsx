import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-slate-900">Create a student account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Student self-registration (with email verification) is implemented in Phase 1.
        For now, use a seeded demo account to sign in.
      </p>
      <Link href="/login" className="mt-6 text-sm font-semibold text-brand-600">
        ← Back to sign in
      </Link>
    </main>
  );
}
