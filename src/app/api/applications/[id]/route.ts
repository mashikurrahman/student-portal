import { handle, notFound, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { applicationRepository } from "@/server/repositories/application.repository";
import { buildChecklist } from "@/server/services/checklist";

export const dynamic = "force-dynamic";

const POST_ADMISSION_STAGES = new Set(["offer_received", "accepted", "enrolled"]);

export function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requirePermission("application:create");
    const { id } = await params;
    const app = await applicationRepository.findForStudent(id, user.id);
    if (!app) throw notFound("Application");

    const checklist = buildChecklist(
      app.requirementSet.requiredDocuments.map((d) => ({
        documentType: d.documentType,
        phase: d.phase,
        required: d.required,
        notes: d.notes,
      })),
      app.documents.map((d) => ({
        documentType: d.documentType,
        phase: d.phase,
        reviewStatus: d.reviewStatus,
      })),
      { includePostAdmission: POST_ADMISSION_STAGES.has(app.stage) },
    );

    return ok({ application: app, checklist });
  });
}
