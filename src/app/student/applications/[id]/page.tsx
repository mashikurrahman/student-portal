import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { applicationRepository } from "@/server/repositories/application.repository";
import { buildChecklist, isCorePhaseComplete } from "@/server/services/checklist";
import { Badge, eligibilityTone, statusTone } from "@/components/Badge";
import { MessagePanel } from "@/components/MessagePanel";
import { docTypeLabel, ELIGIBILITY_LABELS, stageLabel } from "@/lib/labels";
import { DocumentUploader } from "./DocumentUploader";
import { SubmitApplication } from "./SubmitApplication";

export const dynamic = "force-dynamic";

const POST_ADMISSION_STAGES = new Set(["offer_received", "accepted", "enrolled"]);
const STATUS_LABELS: Record<string, string> = {
  missing: "Not uploaded",
  pending: "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
  reupload_requested: "Re-upload requested",
};

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const app = userId ? await applicationRepository.findForStudent(id, userId) : null;
  if (!app) notFound();

  const required = app.requirementSet.requiredDocuments.map((d) => ({
    documentType: d.documentType,
    phase: d.phase,
    required: d.required,
    notes: d.notes,
  }));
  const uploaded = app.documents.map((d) => ({
    documentType: d.documentType,
    phase: d.phase,
    reviewStatus: d.reviewStatus,
  }));

  const checklist = buildChecklist(required, uploaded, {
    includePostAdmission: POST_ADMISSION_STAGES.has(app.stage),
  });
  const coreComplete = isCorePhaseComplete(required, uploaded);
  const canSubmit = app.stage === "documents_pending" && coreComplete;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{app.program.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {app.program.university.name} · {app.program.university.country.name} · {app.intake}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone={eligibilityTone(app.eligibilityResult)}>
              {ELIGIBILITY_LABELS[app.eligibilityResult]}
            </Badge>
            <Badge tone="neutral">{stageLabel(app.stage)}</Badge>
          </div>
        </div>
        {app.stage === "documents_pending" && (
          <SubmitApplication applicationId={app.id} disabled={!canSubmit} />
        )}
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Document checklist</h2>
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {checklist.map((item) => (
            <li key={item.documentType} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium text-slate-800">
                  {docTypeLabel(item.documentType)}
                  {!item.required && <span className="ml-2 text-xs text-slate-400">(optional)</span>}
                </p>
                {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
                <div className="mt-1">
                  <Badge tone={statusTone(item.status)}>{STATUS_LABELS[item.status]}</Badge>
                </div>
              </div>
              {app.stage === "documents_pending" && item.status !== "approved" && (
                <DocumentUploader applicationId={app.id} documentType={item.documentType} />
              )}
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

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
        <ol className="mt-4 space-y-3">
          <li className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">Created</span> ·{" "}
            {app.createdAt.toLocaleString()}
          </li>
          {app.events.map((ev) => (
            <li key={ev.id} className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">
                {ev.toStage ? stageLabel(ev.toStage) : "Update"}
              </span>{" "}
              · {ev.createdAt.toLocaleString()}
              {ev.note && <span className="text-slate-400"> — {ev.note}</span>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
