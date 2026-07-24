import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { agentRepository } from "@/server/repositories/agent.repository";
import { Badge, eligibilityTone } from "@/components/Badge";
import { ELIGIBILITY_LABELS, stageLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

// Stages surfaced as actionable columns, in pipeline order.
const COLUMN_ORDER = [
  "ready_for_review",
  "under_agent_review",
  "documents_pending",
  "submitted_to_university",
  "university_reviewing",
  "offer_received",
  "accepted",
  "enrolled",
  "rejected",
  "withdrawn",
];

interface StudentProfile {
  fullName: string;
}

export default async function AgentCaseload() {
  const session = await getServerSession(authOptions);
  const caseload = session?.user?.id ? await agentRepository.listCaseload(session.user.id) : [];

  const byStage = new Map<string, typeof caseload>();
  for (const app of caseload) {
    const list = byStage.get(app.stage) ?? [];
    list.push(app);
    byStage.set(app.stage, list);
  }
  const activeColumns = COLUMN_ORDER.filter((s) => (byStage.get(s)?.length ?? 0) > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My caseload</h1>
      <p className="mt-1 text-sm text-slate-600">
        {caseload.length} assigned application{caseload.length === 1 ? "" : "s"}.
      </p>

      {caseload.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No students are assigned to you yet.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {activeColumns.map((stage) => (
            <section key={stage}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {stageLabel(stage)}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {byStage.get(stage)?.length}
                </span>
              </h2>
              <ul className="space-y-2">
                {byStage.get(stage)?.map((app) => {
                  const profile = app.student.profile as StudentProfile | null;
                  return (
                    <li key={app.id}>
                      <Link
                        href={`/agent/applications/${app.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {profile?.fullName ?? app.student.email}
                          </p>
                          <p className="text-sm text-slate-500">
                            {app.program.name} · {app.program.university.name} · {app.intake}
                          </p>
                        </div>
                        <Badge tone={eligibilityTone(app.eligibilityResult)}>
                          {ELIGIBILITY_LABELS[app.eligibilityResult]}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
