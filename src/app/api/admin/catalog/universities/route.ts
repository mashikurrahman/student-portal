import type { NextRequest } from "next/server";
import { created, handle } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { platformService } from "@/server/services/platform-service";
import { createUniversitySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("catalog:manage");
    const input = createUniversitySchema.parse(await req.json());
    return created(await platformService.createUniversity(input));
  });
}
