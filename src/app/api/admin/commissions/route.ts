import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { agencyAdminService } from "@/server/services/agency-admin-service";
import { commissionSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("commission:manage");
    return ok(await agencyAdminService.listCommissions(user));
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("commission:manage");
    const input = commissionSchema.parse(await req.json());
    return created(await agencyAdminService.createCommission(user, input));
  });
}
