import { PrismaClient, type DegreeLevel, type DocPhase, type DocumentType } from "@prisma/client";

/**
 * Germany catalog seed — real universities with representative English-taught
 * programs and indicative requirements for Bangladeshi (and other international)
 * applicants. See docs/catalog/germany.md for the full guide and sources.
 *
 * NOTE: Requirement thresholds, fees, and deadlines are INDICATIVE starter data.
 * Verify against each program's official page and uni-assist before applying.
 *
 * Run standalone:  npm run db:seed:germany
 */

const INTAKE = "Fall 2026";
const WINTER_DEADLINE = new Date("2026-07-15");
const UNI_ASSIST_FEE = 75; // typical uni-assist handling fee (first application)

interface ProgramSeed {
  id: string;
  name: string;
  degreeLevel: DegreeLevel;
  discipline: string;
  durationMonths: number;
  tuitionAnnual: number; // 0 for tuition-free public universities
  minGpa?: number;
  minIelts?: number;
  minToefl?: number;
  note?: string; // program-specific tip shown on the checklist
}

interface UniversitySeed {
  id: string;
  name: string;
  city: string;
  ranking?: number;
  programs: ProgramSeed[];
}

// Shared document checklist for German programs (core + post-admission).
const DOCUMENTS: {
  documentType: DocumentType;
  phase: DocPhase;
  required: boolean;
  notes?: string;
}[] = [
  { documentType: "transcript", phase: "core", required: true, notes: "Bachelor's/HSC transcript + certified English translation." },
  { documentType: "diploma", phase: "core", required: true, notes: "Degree certificate (or provisional)." },
  { documentType: "english_test", phase: "core", required: true, notes: "IELTS 6.5 (min 6.0 per band) or TOEFL iBT ~88. German C1 for German-taught programs." },
  { documentType: "sop", phase: "core", required: true, notes: "Statement of Purpose / motivation letter." },
  { documentType: "cv", phase: "core", required: true, notes: "Academic CV." },
  { documentType: "recommendation_letter", phase: "core", required: true, notes: "1–2 letters of recommendation." },
  { documentType: "passport", phase: "core", required: true, notes: "Passport bio page." },
  { documentType: "financial_proof", phase: "post_admission", required: true, notes: "Blocked account ~€11,904/year (~€992/month) for the student visa." },
  { documentType: "insurance", phase: "post_admission", required: true, notes: "German health insurance confirmation (~€120/month public)." },
  { documentType: "visa_document", phase: "post_admission", required: true, notes: "Visa forms (2 sets for Bangladesh) + admission letter. Note: Bangladesh does NOT need APS." },
];

const UNIVERSITIES: UniversitySeed[] = [
  {
    id: "de-rwth",
    name: "RWTH Aachen University",
    city: "Aachen",
    ranking: 99,
    programs: [
      { id: "de-rwth-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
      { id: "de-rwth-mech", name: "MSc Mechanical Engineering", degreeLevel: "master", discipline: "Mechanical Engineering", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-tu-berlin",
    name: "Technical University of Berlin",
    city: "Berlin",
    ranking: 154,
    programs: [
      { id: "de-tub-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
      { id: "de-tub-icts", name: "MSc ICT Innovation", degreeLevel: "master", discipline: "Information & Communication Tech", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-tu-darmstadt",
    name: "Technical University of Darmstadt",
    city: "Darmstadt",
    ranking: 279,
    programs: [
      { id: "de-tud-dss", name: "MSc Distributed Software Systems", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
      { id: "de-tud-ee", name: "MSc Electrical Engineering & Information Technology", degreeLevel: "master", discipline: "Electrical Engineering", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-stuttgart",
    name: "University of Stuttgart",
    city: "Stuttgart",
    ranking: 312,
    programs: [
      { id: "de-stu-infotech", name: "MSc Information Technology (INFOTECH)", degreeLevel: "master", discipline: "Electrical Engineering", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5, note: "Baden-Württemberg: non-EU students may pay ~€1,500/semester." },
      { id: "de-stu-comp-mech", name: "MSc Computational Mechanics of Materials & Structures", degreeLevel: "master", discipline: "Mechanical Engineering", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5, note: "Baden-Württemberg non-EU fee may apply." },
    ],
  },
  {
    id: "de-kit",
    name: "Karlsruhe Institute of Technology (KIT)",
    city: "Karlsruhe",
    ranking: 119,
    programs: [
      { id: "de-kit-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5, note: "Baden-Württemberg non-EU fee ~€1,500/semester may apply." },
      { id: "de-kit-energy", name: "MSc Energy Engineering & Management", degreeLevel: "master", discipline: "Energy Engineering", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-freiburg",
    name: "University of Freiburg",
    city: "Freiburg",
    ranking: 192,
    programs: [
      { id: "de-fr-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5, note: "Baden-Württemberg non-EU fee may apply." },
      { id: "de-fr-renewable", name: "MSc Renewable Energy Engineering & Management", degreeLevel: "master", discipline: "Renewable Energy", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-heidelberg",
    name: "Heidelberg University",
    city: "Heidelberg",
    ranking: 87,
    programs: [
      { id: "de-hd-scicomp", name: "MSc Scientific Computing", degreeLevel: "master", discipline: "Data Science", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.2, minIelts: 6.5, note: "Baden-Württemberg non-EU fee may apply." },
      { id: "de-hd-datascience", name: "MSc Data & Computer Science", degreeLevel: "master", discipline: "Data Science", durationMonths: 24, tuitionAnnual: 3000, minGpa: 3.2, minIelts: 6.5 },
    ],
  },
  {
    id: "de-bonn",
    name: "University of Bonn",
    city: "Bonn",
    ranking: 239,
    programs: [
      { id: "de-bonn-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
      { id: "de-bonn-econ", name: "MSc Economics", degreeLevel: "master", discipline: "Economics", durationMonths: 24, tuitionAnnual: 0, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-tum",
    name: "Technical University of Munich (TUM)",
    city: "Munich",
    ranking: 28,
    programs: [
      { id: "de-tum-informatics", name: "MSc Informatics", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 12000, minGpa: 3.3, minIelts: 6.5, note: "TUM charges non-EU tuition ~€4,000–€6,000/semester (from WS 2024/25)." },
      { id: "de-tum-mgmt", name: "MSc Management & Technology", degreeLevel: "master", discipline: "Management", durationMonths: 24, tuitionAnnual: 12000, minGpa: 3.3, minIelts: 6.5, note: "TUM non-EU tuition applies; GMAT/GRE may be required." },
    ],
  },
  {
    id: "de-constructor",
    name: "Constructor University Bremen (private)",
    city: "Bremen",
    programs: [
      { id: "de-con-ds", name: "MSc Data Science for Society & Business", degreeLevel: "master", discipline: "Data Science", durationMonths: 24, tuitionAnnual: 20000, minGpa: 3.0, minIelts: 6.5, note: "Private, English-medium; scholarships available." },
      { id: "de-con-sci", name: "MSc Supply Chain Engineering & Management", degreeLevel: "master", discipline: "Management", durationMonths: 24, tuitionAnnual: 20000, minGpa: 3.0, minIelts: 6.5 },
    ],
  },
  {
    id: "de-iu",
    name: "IU International University of Applied Sciences (private)",
    city: "Erfurt",
    programs: [
      { id: "de-iu-cs", name: "MSc Computer Science", degreeLevel: "master", discipline: "Computer Science", durationMonths: 24, tuitionAnnual: 12000, minGpa: 2.8, minIelts: 6.0, note: "Private; flexible/on-campus options; rolling intakes." },
      { id: "de-iu-datascience", name: "MSc Data Science", degreeLevel: "master", discipline: "Data Science", durationMonths: 24, tuitionAnnual: 12000, minGpa: 2.8, minIelts: 6.0 },
    ],
  },
];

export async function seedGermany(prisma: PrismaClient): Promise<void> {
  const germany = await prisma.country.upsert({
    where: { isoCode: "DE" },
    update: {},
    create: { name: "Germany", isoCode: "DE" },
  });

  for (const uni of UNIVERSITIES) {
    await prisma.university.upsert({
      where: { id: uni.id },
      update: { name: uni.name, city: uni.city, ranking: uni.ranking ?? null },
      create: {
        id: uni.id,
        countryId: germany.id,
        name: uni.name,
        city: uni.city,
        ranking: uni.ranking ?? null,
      },
    });

    for (const p of uni.programs) {
      await prisma.program.upsert({
        where: { id: p.id },
        update: { name: p.name, discipline: p.discipline, tuitionAnnual: p.tuitionAnnual },
        create: {
          id: p.id,
          universityId: uni.id,
          name: p.name,
          degreeLevel: p.degreeLevel,
          discipline: p.discipline,
          durationMonths: p.durationMonths,
          tuitionAnnual: p.tuitionAnnual,
        },
      });

      // Create a requirement set (v1) for this intake if none exists yet.
      const existing = await prisma.requirementSet.findFirst({
        where: { programId: p.id, intake: INTAKE },
      });
      if (existing) continue;

      await prisma.requirementSet.create({
        data: {
          programId: p.id,
          intake: INTAKE,
          version: 1,
          minGpa: p.minGpa ?? 3.0,
          gpaScale: 4,
          minIelts: p.minIelts ?? 6.5,
          minToefl: p.minToefl ?? 88,
          applicationDeadline: WINTER_DEADLINE,
          applicationFee: UNI_ASSIST_FEE,
          active: true,
          requiredDocuments: {
            create: DOCUMENTS.map((d) => ({
              documentType: d.documentType,
              phase: d.phase,
              required: d.required,
              notes: p.note && d.documentType === "transcript" ? `${d.notes} ${p.note}` : d.notes,
            })),
          },
        },
      });
    }
  }

  const programCount = UNIVERSITIES.reduce((n, u) => n + u.programs.length, 0);
  console.log(`Germany seed complete: ${UNIVERSITIES.length} universities, ${programCount} programs.`);
}

// Allow running this file directly.
const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/seeds/germany.ts");
if (isMain) {
  const prisma = new PrismaClient();
  seedGermany(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
