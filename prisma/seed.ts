import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

/**
 * Seeds a demo agency, one user per role, and a small catalog with
 * RequirementSets. Idempotent: safe to run repeatedly. Demo password for all
 * accounts: "Password123!".
 */
const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, ARGON);

  const agency = await prisma.agency.upsert({
    where: { id: "demo-agency" },
    update: {},
    create: { id: "demo-agency", name: "Global Education Partners" },
  });

  const [student, agent] = await Promise.all([
    prisma.user.upsert({
      where: { email: "student@demo.local" },
      update: {},
      create: {
        email: "student@demo.local",
        role: "student",
        agencyId: agency.id,
        passwordHash,
        emailVerifiedAt: new Date(),
        status: "active",
        profile: {
          create: {
            fullName: "Aisha Rahman",
            nationality: "BD",
            educationHistory: [
              { level: "bachelor", institution: "Dhaka University", gpa: 3.6, gpaScale: 4, year: 2025 },
            ],
            testScores: { ielts: 7.0 },
            budgetAnnual: 25000,
            targetIntake: "Fall 2026",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "agent@demo.local" },
      update: {},
      create: {
        email: "agent@demo.local",
        role: "agent",
        agencyId: agency.id,
        passwordHash,
        emailVerifiedAt: new Date(),
        status: "active",
      },
    }),
  ]);

  await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@demo.local" },
      update: {},
      create: {
        email: "admin@demo.local",
        role: "agency_admin",
        agencyId: agency.id,
        passwordHash,
        emailVerifiedAt: new Date(),
        status: "active",
      },
    }),
    prisma.user.upsert({
      where: { email: "super@demo.local" },
      update: {},
      create: {
        email: "super@demo.local",
        role: "super_admin",
        agencyId: null,
        passwordHash,
        emailVerifiedAt: new Date(),
        status: "active",
      },
    }),
  ]);

  // Assign the demo student to the demo agent.
  await prisma.assignment.upsert({
    where: { agentUserId_studentUserId: { agentUserId: agent.id, studentUserId: student.id } },
    update: {},
    create: { agencyId: agency.id, agentUserId: agent.id, studentUserId: student.id },
  });

  // ---- Catalog: Canada → University of Toronto → MSc CS ----
  const canada = await prisma.country.upsert({
    where: { isoCode: "CA" },
    update: {},
    create: { name: "Canada", isoCode: "CA" },
  });

  const uoft = await prisma.university.upsert({
    where: { id: "uoft" },
    update: {},
    create: { id: "uoft", countryId: canada.id, name: "University of Toronto", city: "Toronto", ranking: 21 },
  });

  const program = await prisma.program.upsert({
    where: { id: "uoft-msc-cs" },
    update: {},
    create: {
      id: "uoft-msc-cs",
      universityId: uoft.id,
      name: "MSc Computer Science",
      degreeLevel: "master",
      discipline: "Computer Science",
      durationMonths: 24,
      tuitionAnnual: 30000,
    },
  });

  const reqSet = await prisma.requirementSet.upsert({
    where: { programId_intake_version: { programId: program.id, intake: "Fall 2026", version: 1 } },
    update: {},
    create: {
      programId: program.id,
      intake: "Fall 2026",
      version: 1,
      minGpa: 3.3,
      gpaScale: 4,
      minIelts: 6.5,
      minToefl: 90,
      applicationDeadline: new Date("2026-01-15"),
      applicationFee: 125,
    },
  });

  const requiredDocs: {
    documentType:
      | "transcript"
      | "english_test"
      | "passport"
      | "sop"
      | "recommendation_letter"
      | "financial_proof";
    phase: "core" | "post_admission";
  }[] = [
    { documentType: "transcript", phase: "core" },
    { documentType: "english_test", phase: "core" },
    { documentType: "passport", phase: "core" },
    { documentType: "sop", phase: "core" },
    { documentType: "recommendation_letter", phase: "core" },
    { documentType: "financial_proof", phase: "post_admission" },
  ];

  for (const d of requiredDocs) {
    const exists = await prisma.requiredDocument.findFirst({
      where: { requirementSetId: reqSet.id, documentType: d.documentType },
    });
    if (!exists) {
      await prisma.requiredDocument.create({
        data: { requirementSetId: reqSet.id, ...d, required: true },
      });
    }
  }

  console.log("Seed complete. Demo login password:", DEMO_PASSWORD);
  console.log("Users: student@demo.local, agent@demo.local, admin@demo.local, super@demo.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
