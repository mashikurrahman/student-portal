import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { agencyAdminService } from "@/server/services/agency-admin-service";
import { assignStudentSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("student:assign");
    const { studentUserId, agentUserId } = assignStudentSchema.parse(await req.json());
    return ok(await agencyAdminService.assignStudent(user, studentUserId, agentUserId));
  });
}
