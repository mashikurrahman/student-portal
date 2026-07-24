import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { catalogRepository } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    await requirePermission("catalog:read");
    return ok(await catalogRepository.listCountries());
  });
}
