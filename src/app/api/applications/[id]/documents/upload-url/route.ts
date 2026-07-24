import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { documentService } from "@/server/services/document-service";
import { uploadUrlSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requirePermission("document:upload");
    const { id } = await params;
    const body = uploadUrlSchema.parse(await req.json());
    return ok(await documentService.createUploadUrl(user, id, body));
  });
}
