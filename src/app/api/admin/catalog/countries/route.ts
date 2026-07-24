import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { catalogRepository } from "@/server/repositories/catalog.repository";
import { platformService } from "@/server/services/platform-service";
import { createCountrySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    await requirePermission("catalog:manage");
    return ok(await catalogRepository.listCountries());
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("catalog:manage");
    const input = createCountrySchema.parse(await req.json());
    return created(await platformService.createCountry(input));
  });
}
