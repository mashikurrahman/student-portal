import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { applicationRepository } from "@/server/repositories/application.repository";
import { applicationService } from "@/server/services/application-service";
import { createApplicationSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("application:create");
    return ok(await applicationRepository.listForStudent(user.id));
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("application:create");
    const body = createApplicationSchema.parse(await req.json());
    const application = await applicationService.create(user, body.requirementSetId);
    return created(application);
  });
}
