import type { NextRequest } from "next/server";
import { created, handle, ok } from "@/lib/api";
import { requireUser } from "@/server/auth/session";
import { messageService } from "@/server/services/message-service";
import { sendMessageSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    return ok(await messageService.list(user, id));
  });
}

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { body } = sendMessageSchema.parse(await req.json());
    return created(await messageService.send(user, id, body));
  });
}
