import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { agencyAdminService } from "@/server/services/agency-admin-service";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("reporting:view");
    return ok(await agencyAdminService.report(user));
  });
}
