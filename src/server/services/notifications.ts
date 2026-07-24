import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Notification skeleton. Writes an in-app notification row and (in later phases)
 * enqueues a transactional email. Email delivery is stubbed for Phase 1.
 */
export type NotificationType =
  | "application_submitted"
  | "document_reviewed"
  | "stage_changed"
  | "offer_received";

export async function notify(params: {
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      payload: params.payload as Prisma.InputJsonValue,
    },
  });
  // TODO(Phase 4): enqueue transactional email via the email provider.
}
