import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { platformService } from "@/server/services/platform-service";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("audit:view");
    return ok(await platformService.auditLog(user));
  });
}
