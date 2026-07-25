import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { agentRepository } from "@/server/repositories/agent.repository";
import { Badge, eligibilityTone, statusTone } from "@/components/Badge";
import { ProgressTracker } from "@/components/ProgressTracker";
import { MessagePanel } from "@/components/MessagePanel";
import { docTypeLabel, ELIGIBILITY_LABELS, stageLabel } from "@/lib/labels";
import { DocumentReview } from "./DocumentReview";
import { StageActions } from "./StageActions";

export const dynamic = "force-dynamic";

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
  reupload_requested: "Re-upload requested",
};

interface StudentProfile {
  fullName: string;
  nationality: string | null;
  testScores: unknown;
}

export default async function AgentApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const app = userId ? await agentRepository.findForAgent(id, userId) : null;
  if (!app) notFound();

  const profile = app.student.profile as StudentProfile | null;
  const reviewing = app.stage === "under_agent_review";
  const approvedCount = app.documents.filter((d) => d.reviewStatus === "approved").length;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.fullName ?? app.student.email}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {app.program.name} · {app.program.university.name} ·{" "}
            {app.program.university.country.name} · {app.intake}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone={eligibilityTone(app.eligibilityResult)}>
              {ELIGIBILITY_LABELS[app.eligibilityResult]}
            </Badge>
            <Badge tone="neutral">{stageLabel(app.stage)}</Badge>
          </div>
        </header>

        <ProgressTracker stage={app.stage} />

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            {approvedCount > 0 && (
              <a
                href={`/api/agent/applications/${app.id}/bundle`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Download bundle ({approvedCount})
              </a>
            )}
          </div>
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {app.documents.length === 0 && (
              <li className="px-5 py-4 text-sm text-slate-400">No documents uploaded yet.</li>
            )}
            {app.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-800">{docTypeLabel(doc.documentType)}</p>
                  <p className="text-xs text-slate-500">
                    {doc.fileName} · v{doc.version}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={statusTone(doc.reviewStatus)}>
                      {REVIEW_STATUS_LABELS[doc.reviewStatus]}
                    </Badge>
                    {doc.reviewReason && (
                      <span className="text-xs text-slate-400">— {doc.reviewReason}</span>
                    )}
                  </div>
                </div>
                <DocumentReview
                  applicationId={app.id}
                  documentId={doc.id}
                  disabled={!reviewing}
                />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
          <div className="mt-4">
            <MessagePanel applicationId={app.id} currentUserId={userId as string} />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Pipeline actions</h3>
          <div className="mt-3">
            <StageActions applicationId={app.id} stage={app.stage} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Applicant</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-800">{app.student.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Nationality</dt>
              <dd className="text-slate-800">{profile?.nationality ?? "—"}</dd>
            </div>
            {app.universityReference && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Univ. ref</dt>
                <dd className="text-slate-800">{app.universityReference}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
          <ol className="mt-3 space-y-2 text-xs text-slate-600">
            {app.events.map((ev) => (
              <li key={ev.id}>
                <span className="font-medium text-slate-800">
                  {ev.toStage ? stageLabel(ev.toStage) : "Update"}
                </span>{" "}
                · {ev.createdAt.toLocaleString()}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
