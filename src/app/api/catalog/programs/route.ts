import type { NextRequest } from "next/server";
import { fail, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { catalogRepository } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("catalog:read");
    const universityId = req.nextUrl.searchParams.get("universityId");
    if (!universityId) return fail("universityId is required", 400);
    return ok(await catalogRepository.listPrograms(universityId));
  });
}
