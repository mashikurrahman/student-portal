import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { reviewService } from "@/server/services/review-service";
import { reviewActionSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  return handle(async () => {
    const user = await requirePermission("document:review");
    const { id, docId } = await params;
    const { action, reason } = reviewActionSchema.parse(await req.json());
    return ok(await reviewService.review(user, id, docId, action, reason));
  });
}
