import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Agency-admin data access. Every read/write is constrained to a single
 * agencyId — the tenant-isolation boundary for agency admins (docs/SECURITY.md §3).
 */
export const adminRepository = {
  listAgents(agencyId: string) {
    return prisma.user.findMany({
      where: { agencyId, role: "agent" },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, status: true, createdAt: true },
    });
  },

  listStudents(agencyId: string) {
    return prisma.user.findMany({
      where: { agencyId, role: "student" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        status: true,
        profile: { select: { fullName: true } },
        studentAssignments: {
          select: { agentUserId: true, agent: { select: { email: true } } },
        },
      },
    });
  },

  findUserInAgency(userId: string, agencyId: string) {
    return prisma.user.findFirst({ where: { id: userId, agencyId } });
  },

  setUserStatus(userId: string, status: "active" | "disabled") {
    return prisma.user.update({ where: { id: userId }, data: { status } });
  },

  /** Rows for reporting, scoped to the agency. */
  reportingRows(agencyId: string) {
    return prisma.application.findMany({
      where: { agencyId },
      select: {
        stage: true,
        assignedAgentUserId: true,
        assignedAgent: { select: { email: true } },
        program: { select: { university: { select: { country: { select: { name: true } } } } } },
      },
    });
  },

  listCommissions(agencyId: string) {
    return prisma.commission.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          select: { id: true, program: { select: { name: true } }, student: { select: { email: true } } },
        },
      },
    });
  },

  createCommission(data: Prisma.CommissionUncheckedCreateInput) {
    return prisma.commission.create({ data });
  },

  applicationInAgency(applicationId: string, agencyId: string) {
    return prisma.application.findFirst({ where: { id: applicationId, agencyId } });
  },
};
