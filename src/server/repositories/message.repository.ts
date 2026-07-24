import { prisma } from "@/lib/prisma";

/**
 * Messages belong to an application thread. Access is authorized by the caller
 * (participant check lives in the message service).
 */
export const messageRepository = {
  listForApplication(applicationId: string) {
    return prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, email: true, role: true } } },
    });
  },

  create(applicationId: string, senderUserId: string, body: string) {
    return prisma.message.create({
      data: { applicationId, senderUserId, body },
    });
  },
};
