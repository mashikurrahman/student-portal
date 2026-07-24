import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { adminRepository } from "@/server/repositories/admin.repository";
import { agencyAdminService } from "@/server/services/agency-admin-service";
import { inviteAgentSchema } from "@/lib/validation/schemas";
import { HttpError } from "@/lib/api";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("agent:manage");
    if (!user.agencyId) throw new HttpError(400, "No agency linked to your account.");
    return ok(await adminRepository.listAgents(user.agencyId));
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("agent:manage");
    const { email } = inviteAgentSchema.parse(await req.json());
    return created(await agencyAdminService.inviteAgent(user, email));
  });
}
