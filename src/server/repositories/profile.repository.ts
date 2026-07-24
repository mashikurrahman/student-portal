import { prisma } from "@/lib/prisma";
import type { ProfileUpdateInput } from "@/lib/validation/schemas";

/**
 * Student profile access. A profile is 1:1 with a student User and only ever
 * accessed by its owner.
 */
export const profileRepository = {
  get(userId: string) {
    return prisma.studentProfile.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: ProfileUpdateInput) {
    const payload = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth ?? null,
      nationality: data.nationality ?? null,
      phone: data.phone ?? null,
      educationHistory: data.educationHistory,
      testScores: data.testScores,
      budgetAnnual: data.budgetAnnual ?? null,
      targetIntake: data.targetIntake ?? null,
    };
    return prisma.studentProfile.upsert({
      where: { userId },
      create: { userId, ...payload },
      update: payload,
    });
  },
};
