import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { applicationRepository } from "@/server/repositories/application.repository";
import { Badge, eligibilityTone } from "@/components/Badge";
import { ELIGIBILITY_LABELS, stageLabel } from "@/lib/labels";
import { deadlineInfo, deadlineTone } from "@/lib/deadline";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const applications = userId ? await applicationRepository.listForStudent(userId) : [];

  // Deadline info per application, keyed by id.
  const deadlines = new Map(
    applications.map((app) => [
      app.id,
      deadlineInfo(app.requirementSet?.applicationDeadline, app.stage),
    ]),
  );
  // Applications due within the reminder window (soonest first).
  const dueSoon = applications
    .filter((app) => {
      const d = deadlines.get(app.id);
      return d && d.urgency !== "later";
    })
    .sort((a, b) => deadlines.get(a.id)!.daysLeft - deadlines.get(b.id)!.daysLeft);

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

      {dueSoon.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            ⏰ {dueSoon.length} application{dueSoon.length > 1 ? "s" : ""} approaching a deadline
          </p>
          <ul className="mt-2 space-y-1">
            {dueSoon.map((app) => {
              const d = deadlines.get(app.id)!;
              return (
                <li key={app.id} className="text-sm text-amber-800">
                  <Link href={`/student/applications/${app.id}`} className="hover:underline">
                    {app.program.name}
                  </Link>{" "}
                  — {d.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
                    {(() => {
                      const d = deadlines.get(app.id);
                      return d ? (
                        <Badge tone={deadlineTone(d.urgency)}>{d.label}</Badge>
                      ) : null;
                    })()}
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
