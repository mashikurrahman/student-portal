import { handle, ok, HttpError } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { adminRepository } from "@/server/repositories/admin.repository";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requirePermission("student:assign");
    if (!user.agencyId) throw new HttpError(400, "No agency linked to your account.");
    return ok(await adminRepository.listStudents(user.agencyId));
  });
}
