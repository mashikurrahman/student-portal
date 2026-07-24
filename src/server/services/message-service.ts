import { prisma } from "@/lib/prisma";
import { forbidden, notFound } from "@/lib/api";
import { messageRepository } from "@/server/repositories/message.repository";
import { notify } from "./notifications";
import type { AuthUser } from "@/server/auth/session";

/**
 * Per-application messaging between a student and their assigned agent. Access
 * is limited to the two participants (plus same-agency admins).
 */
async function authorizeParticipant(user: AuthUser, applicationId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, studentUserId: true, assignedAgentUserId: true, agencyId: true },
  });
  if (!app) throw notFound("Application");

  const isStudent = app.studentUserId === user.id;
  const isAgent = app.assignedAgentUserId === user.id;
  const isAgencyAdmin =
    (user.role === "agency_admin" || user.role === "super_admin") &&
    (user.role === "super_admin" || app.agencyId === user.agencyId);

  if (!isStudent && !isAgent && !isAgencyAdmin) throw forbidden();
  return app;
}

export const messageService = {
  async list(user: AuthUser, applicationId: string) {
    await authorizeParticipant(user, applicationId);
    return messageRepository.listForApplication(applicationId);
  },

  async send(user: AuthUser, applicationId: string, body: string) {
    const app = await authorizeParticipant(user, applicationId);
    const message = await messageRepository.create(applicationId, user.id, body);

    // Notify the other participant.
    const recipient =
      user.id === app.studentUserId ? app.assignedAgentUserId : app.studentUserId;
    if (recipient) {
      await notify({
        userId: recipient,
        type: "stage_changed",
        payload: { applicationId, kind: "message" },
      });
    }
    return message;
  },
};
