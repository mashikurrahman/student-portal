import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { profileRepository } from "@/server/repositories/profile.repository";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("profile:manage");
    return ok(await profileRepository.get(user.id));
  });
}

export function PUT(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("profile:manage");
    const body = profileUpdateSchema.parse(await req.json());
    return ok(await profileRepository.upsert(user.id, body));
  });
}
