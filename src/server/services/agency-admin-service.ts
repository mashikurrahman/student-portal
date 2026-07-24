import { prisma } from "@/lib/prisma";
import { HttpError, forbidden, notFound } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";
import { adminRepository } from "@/server/repositories/admin.repository";
import { computeReport } from "./reporting";
import { writeAudit } from "./audit";
import type { AuthUser } from "@/server/auth/session";
import type { CommissionInput } from "@/lib/validation/schemas";

function requireAgency(user: AuthUser): string {
  if (!user.agencyId) throw new HttpError(400, "Your account is not linked to an agency.");
  return user.agencyId;
}

/**
 * Agency-admin operations, all constrained to the admin's own agency.
 */
export const agencyAdminService = {
  async inviteAgent(user: AuthUser, email: string) {
    const agencyId = requireAgency(user);
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw new HttpError(409, "A user with that email already exists.");

    const tempPassword = generateTempPassword();
    const created = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        role: "agent",
        agencyId,
        passwordHash: await hashPassword(tempPassword),
        status: "active",
        emailVerifiedAt: new Date(),
      },
      select: { id: true, email: true },
    });

    await writeAudit({
      actorUserId: user.id,
      action: "agent.invited",
      resourceType: "user",
      resourceId: created.id,
      metadata: { agencyId },
    });

    // Temp password returned once so the admin can share it out of band.
    return { user: created, tempPassword };
  },

  async setAgentStatus(user: AuthUser, agentUserId: string, status: "active" | "disabled") {
    const agencyId = requireAgency(user);
    const target = await adminRepository.findUserInAgency(agentUserId, agencyId);
    if (!target || target.role !== "agent") throw notFound("Agent");
    const updated = await adminRepository.setUserStatus(agentUserId, status);
    await writeAudit({
      actorUserId: user.id,
      action: `agent.${status}`,
      resourceType: "user",
      resourceId: agentUserId,
    });
    return { id: updated.id, status: updated.status };
  },

  /**
   * Assigns (or reassigns) a student to an agent. Reassignment also moves the
   * student's non-terminal applications to the new agent.
   */
  async assignStudent(user: AuthUser, studentUserId: string, agentUserId: string) {
    const agencyId = requireAgency(user);
    const [student, agent] = await Promise.all([
      adminRepository.findUserInAgency(studentUserId, agencyId),
      adminRepository.findUserInAgency(agentUserId, agencyId),
    ]);
    if (!student || student.role !== "student") throw notFound("Student");
    if (!agent || agent.role !== "agent") throw notFound("Agent");

    await prisma.$transaction(async (tx) => {
      // Replace any prior assignment for this student in this agency.
      await tx.assignment.deleteMany({ where: { studentUserId, agencyId } });
      await tx.assignment.create({ data: { agencyId, agentUserId, studentUserId } });
      await tx.application.updateMany({
        where: {
          studentUserId,
          agencyId,
          stage: { notIn: ["accepted", "rejected", "withdrawn", "enrolled"] },
        },
        data: { assignedAgentUserId: agentUserId },
      });
    });

    await writeAudit({
      actorUserId: user.id,
      action: "student.assigned",
      resourceType: "user",
      resourceId: studentUserId,
      metadata: { agentUserId },
    });
    return { studentUserId, agentUserId };
  },

  async report(user: AuthUser) {
    const agencyId = requireAgency(user);
    const rows = await adminRepository.reportingRows(agencyId);
    return computeReport(
      rows.map((r) => ({
        stage: r.stage,
        assignedAgentUserId: r.assignedAgentUserId,
        agentEmail: r.assignedAgent?.email ?? null,
        countryName: r.program.university.country.name,
      })),
    );
  },

  listCommissions(user: AuthUser) {
    const agencyId = requireAgency(user);
    return adminRepository.listCommissions(agencyId);
  },

  async createCommission(user: AuthUser, input: CommissionInput) {
    const agencyId = requireAgency(user);
    const app = await adminRepository.applicationInAgency(input.applicationId, agencyId);
    if (!app) throw forbidden();
    return adminRepository.createCommission({
      applicationId: input.applicationId,
      agencyId,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      note: input.note,
    });
  },
};
