import type { NextRequest } from "next/server";
import { created, handle } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { platformService } from "@/server/services/platform-service";
import { createRequirementSetSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("requirementSet:manage");
    const input = createRequirementSetSchema.parse(await req.json());
    return created(await platformService.createRequirementSet(user, input));
  });
}
