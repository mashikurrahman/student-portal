import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Super-admin (platform) data access: agencies, global catalog, requirement
 * sets, and the global audit log. Not agency-scoped.
 */
export const platformRepository = {
  listAgencies() {
    return prisma.agency.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { users: true } } },
    });
  },

  createAgencyWithAdmin(data: {
    name: string;
    adminEmail: string;
    adminPasswordHash: string;
  }) {
    return prisma.agency.create({
      data: {
        name: data.name,
        users: {
          create: {
            email: data.adminEmail.toLowerCase(),
            role: "agency_admin",
            passwordHash: data.adminPasswordHash,
            status: "active",
            emailVerifiedAt: new Date(),
          },
        },
      },
      include: { users: true },
    });
  },

  createCountry(data: Prisma.CountryUncheckedCreateInput) {
    return prisma.country.create({ data });
  },

  createUniversity(data: Prisma.UniversityUncheckedCreateInput) {
    return prisma.university.create({ data });
  },

  createProgram(data: Prisma.ProgramUncheckedCreateInput) {
    return prisma.program.create({ data });
  },

  listRequirementVersions(programId: string, intake: string) {
    return prisma.requirementSet.findMany({
      where: { programId, intake },
      select: { id: true, version: true },
    });
  },

  listAuditLog(params: { actorAgencyId?: string; limit: number }) {
    return prisma.auditLog.findMany({
      where: params.actorAgencyId ? { actor: { agencyId: params.actorAgencyId } } : undefined,
      orderBy: { createdAt: "desc" },
      take: params.limit,
      include: { actor: { select: { email: true, role: true } } },
    });
  },
};
