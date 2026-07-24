import { z } from "zod";
import { ALLOWED_MIME_TYPES } from "@/server/services/documents/validation";

/**
 * Shared Zod schemas validated at API boundaries (see docs/SECURITY.md S5).
 * Types are inferred from the schemas to keep runtime and compile-time in sync.
 */

export const educationEntrySchema = z.object({
  level: z.string().min(1),
  institution: z.string().min(1),
  gpa: z.number().min(0).max(10),
  gpaScale: z.number().positive().max(10),
  year: z.number().int().min(1950).max(2100),
});

export const testScoresSchema = z.object({
  ielts: z.number().min(0).max(9).optional(),
  toefl: z.number().min(0).max(120).optional(),
  pte: z.number().min(0).max(90).optional(),
  duolingo: z.number().min(0).max(160).optional(),
  gre: z.number().min(0).max(340).optional(),
  gmat: z.number().min(0).max(800).optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(200),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().max(100).optional(),
  phone: z.string().max(40).optional(),
  educationHistory: z.array(educationEntrySchema).max(20),
  testScores: testScoresSchema,
  budgetAnnual: z.number().int().nonnegative().optional(),
  targetIntake: z.string().max(50).optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const createApplicationSchema = z.object({
  requirementSetId: z.string().uuid(),
});
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const documentTypeSchema = z.enum([
  "transcript",
  "diploma",
  "english_test",
  "passport",
  "sop",
  "recommendation_letter",
  "cv",
  "financial_proof",
  "sponsor_letter",
  "visa_document",
  "medical",
  "insurance",
  "accommodation",
  "other",
]);

export const uploadUrlSchema = z.object({
  documentType: documentTypeSchema,
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().positive(),
});
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;

export const registerDocumentSchema = z.object({
  documentType: documentTypeSchema,
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().positive(),
});
export type RegisterDocumentInput = z.infer<typeof registerDocumentSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const reviewActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_reupload"]),
  reason: z.string().max(1000).optional(),
});
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;

export const agentTransitionSchema = z.object({
  action: z.enum([
    "start_review",
    "request_changes",
    "submit_to_university",
    "mark_university_reviewing",
    "record_offer",
    "record_rejection",
    "mark_enrolled",
  ]),
  reference: z.string().max(200).optional(),
  note: z.string().max(1000).optional(),
});
export type AgentTransitionInput = z.infer<typeof agentTransitionSchema>;

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ---- Admin ----

export const inviteAgentSchema = z.object({
  email: z.string().email(),
});
export type InviteAgentInput = z.infer<typeof inviteAgentSchema>;

export const assignStudentSchema = z.object({
  studentUserId: z.string().uuid(),
  agentUserId: z.string().uuid(),
});
export type AssignStudentInput = z.infer<typeof assignStudentSchema>;

export const commissionSchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["pending", "invoiced", "paid", "cancelled"]).default("pending"),
  note: z.string().max(500).optional(),
});
export type CommissionInput = z.infer<typeof commissionSchema>;

export const createAgencySchema = z.object({
  name: z.string().min(1).max(200),
  adminEmail: z.string().email(),
});
export type CreateAgencyInput = z.infer<typeof createAgencySchema>;

export const createCountrySchema = z.object({
  name: z.string().min(1).max(100),
  isoCode: z.string().length(2).toUpperCase(),
});

export const createUniversitySchema = z.object({
  countryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  city: z.string().max(100).optional(),
  ranking: z.number().int().positive().optional(),
});

export const createProgramSchema = z.object({
  universityId: z.string().uuid(),
  name: z.string().min(1).max(200),
  degreeLevel: z.enum(["bachelor", "master", "phd", "diploma"]),
  discipline: z.string().min(1).max(120),
  durationMonths: z.number().int().positive().max(120),
  tuitionAnnual: z.number().int().nonnegative(),
});

export const createRequirementSetSchema = z.object({
  programId: z.string().uuid(),
  intake: z.string().min(1).max(50),
  minGpa: z.number().min(0).max(10).optional(),
  gpaScale: z.number().positive().max(10).optional(),
  minIelts: z.number().min(0).max(9).optional(),
  minToefl: z.number().min(0).max(120).optional(),
  minPte: z.number().min(0).max(90).optional(),
  minDuolingo: z.number().min(0).max(160).optional(),
  applicationDeadline: z.coerce.date().optional(),
  applicationFee: z.number().int().nonnegative().default(0),
  requiredDocuments: z
    .array(
      z.object({
        documentType: documentTypeSchema,
        phase: z.enum(["core", "post_admission"]),
        required: z.boolean().default(true),
        notes: z.string().max(300).optional(),
      }),
    )
    .min(1),
});
export type CreateRequirementSetInput = z.infer<typeof createRequirementSetSchema>;
