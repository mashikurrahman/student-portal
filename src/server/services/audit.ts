import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Writes a security audit entry. Used especially for sensitive document access
 * (views/downloads) and privilege actions (see docs/SECURITY.md S8).
 */
export async function writeAudit(params: {
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
