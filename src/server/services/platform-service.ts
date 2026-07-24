import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";
import { platformRepository } from "@/server/repositories/platform.repository";
import { computeNextVersion } from "./requirement-version";
import { writeAudit } from "./audit";
import type { AuthUser } from "@/server/auth/session";
import type {
  CreateAgencyInput,
  CreateRequirementSetInput,
} from "@/lib/validation/schemas";
import type { z } from "zod";
import type {
  createCountrySchema,
  createProgramSchema,
  createUniversitySchema,
} from "@/lib/validation/schemas";

/**
 * Super-admin (platform) operations: onboarding agencies and owning the global
 * catalog + requirement sets. See docs/PRD.md SA1–SA3.
 */
export const platformService = {
  async createAgency(user: AuthUser, input: CreateAgencyInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.adminEmail.toLowerCase() },
    });
    if (existing) throw new HttpError(409, "A user with that admin email already exists.");

    const tempPassword = generateTempPassword();
    const agency = await platformRepository.createAgencyWithAdmin({
      name: input.name,
      adminEmail: input.adminEmail,
      adminPasswordHash: await hashPassword(tempPassword),
    });

    await writeAudit({
      actorUserId: user.id,
      action: "agency.created",
      resourceType: "agency",
      resourceId: agency.id,
    });
    return { agency: { id: agency.id, name: agency.name }, tempPassword };
  },

  createCountry(input: z.infer<typeof createCountrySchema>) {
    return platformRepository.createCountry(input);
  },

  createUniversity(input: z.infer<typeof createUniversitySchema>) {
    return platformRepository.createUniversity(input);
  },

  createProgram(input: z.infer<typeof createProgramSchema>) {
    return platformRepository.createProgram(input);
  },

  /**
   * Creates a new RequirementSet version for a program+intake and supersedes
   * (deactivates) prior active versions — immutable history.
   */
  async createRequirementSet(user: AuthUser, input: CreateRequirementSetInput) {
    const existing = await platformRepository.listRequirementVersions(
      input.programId,
      input.intake,
    );
    const version = computeNextVersion(existing.map((e) => e.version));

    const result = await prisma.$transaction(async (tx) => {
      await tx.requirementSet.updateMany({
        where: { programId: input.programId, intake: input.intake, active: true },
        data: { active: false },
      });
      return tx.requirementSet.create({
        data: {
          programId: input.programId,
          intake: input.intake,
          version,
          minGpa: input.minGpa,
          gpaScale: input.gpaScale,
          minIelts: input.minIelts,
          minToefl: input.minToefl,
          minPte: input.minPte,
          minDuolingo: input.minDuolingo,
          applicationDeadline: input.applicationDeadline,
          applicationFee: input.applicationFee,
          active: true,
          requiredDocuments: {
            create: input.requiredDocuments.map((d) => ({
              documentType: d.documentType,
              phase: d.phase,
              required: d.required,
              notes: d.notes,
            })),
          },
        },
        include: { requiredDocuments: true },
      });
    });

    await writeAudit({
      actorUserId: user.id,
      action: "requirementSet.created",
      resourceType: "requirementSet",
      resourceId: result.id,
      metadata: { programId: input.programId, intake: input.intake, version },
    });
    return result;
  },

  listAgencies() {
    return platformRepository.listAgencies();
  },

  auditLog(user: AuthUser, limit = 100) {
    // Super admin sees the global log; an agency admin is scoped to their agency.
    const actorAgencyId = user.role === "super_admin" ? undefined : (user.agencyId ?? "none");
    return platformRepository.listAuditLog({ actorAgencyId, limit });
  },
};
