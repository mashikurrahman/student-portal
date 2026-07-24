import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { applicationRepository } from "@/server/repositories/application.repository";
import { Badge, eligibilityTone } from "@/components/Badge";
import { ELIGIBILITY_LABELS, stageLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const applications = userId ? await applicationRepository.listForStudent(userId) : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My applications</h1>
        <Link
          href="/student/browse"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start a new application
        </Link>
      </div>

      {applications.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          You have no applications yet. Browse programs to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/student/applications/${app.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{app.program.name}</p>
                    <p className="text-sm text-slate-500">
                      {app.program.university.name} · {app.program.university.country.name} ·{" "}
                      {app.intake}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={eligibilityTone(app.eligibilityResult)}>
                      {ELIGIBILITY_LABELS[app.eligibilityResult]}
                    </Badge>
                    <Badge tone="neutral">{stageLabel(app.stage)}</Badge>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
