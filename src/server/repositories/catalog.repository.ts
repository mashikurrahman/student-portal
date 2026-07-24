import { prisma } from "@/lib/prisma";

/**
 * Read access to the (global) catalog: countries → universities → programs →
 * requirement sets. Catalog data is not agency-scoped.
 */
export const catalogRepository = {
  listCountries() {
    return prisma.country.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  },

  listUniversities(countryId: string) {
    return prisma.university.findMany({
      where: { active: true, countryId },
      orderBy: { name: "asc" },
    });
  },

  listPrograms(universityId: string) {
    return prisma.program.findMany({
      where: { active: true, universityId },
      orderBy: { name: "asc" },
      include: {
        requirementSets: {
          where: { active: true },
          orderBy: [{ intake: "asc" }, { version: "desc" }],
        },
      },
    });
  },

  getRequirementSet(id: string) {
    return prisma.requirementSet.findUnique({
      where: { id },
      include: {
        requiredDocuments: true,
        program: { include: { university: { include: { country: true } } } },
      },
    });
  },
};
