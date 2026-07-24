import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { agencyAdminService } from "@/server/services/agency-admin-service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ status: z.enum(["active", "disabled"]) });

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requirePermission("agent:manage");
    const { id } = await params;
    const { status } = bodySchema.parse(await req.json());
    return ok(await agencyAdminService.setAgentStatus(user, id, status));
  });
}
