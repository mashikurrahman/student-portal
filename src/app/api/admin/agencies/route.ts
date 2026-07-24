import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { platformService } from "@/server/services/platform-service";
import { createAgencySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    await requirePermission("agency:onboard");
    return ok(await platformService.listAgencies());
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("agency:onboard");
    const input = createAgencySchema.parse(await req.json());
    return created(await platformService.createAgency(user, input));
  });
}
