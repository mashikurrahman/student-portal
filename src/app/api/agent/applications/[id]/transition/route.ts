import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { pipelineService } from "@/server/services/pipeline-service";
import { agentTransitionSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requirePermission("application:advance");
    const { id } = await params;
    const { action, reference, note } = agentTransitionSchema.parse(await req.json());
    return ok(await pipelineService.advance(user, id, action, { reference, note }));
  });
}
