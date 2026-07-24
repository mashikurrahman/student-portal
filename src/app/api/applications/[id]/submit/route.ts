import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { applicationService } from "@/server/services/application-service";

export const dynamic = "force-dynamic";

export function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requirePermission("application:create");
    const { id } = await params;
    return ok(await applicationService.submitToAgent(user, id));
  });
}
