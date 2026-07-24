import type { NextRequest } from "next/server";
import { fail, handle, notFound, ok, HttpError } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { catalogRepository } from "@/server/repositories/catalog.repository";
import { profileRepository } from "@/server/repositories/profile.repository";
import { evaluateEligibility } from "@/server/services/eligibility";

export const dynamic = "force-dynamic";

/** Pre-application eligibility preview for a given RequirementSet. */
export function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requirePermission("application:create");
    const requirementSetId = req.nextUrl.searchParams.get("requirementSetId");
    if (!requirementSetId) return fail("requirementSetId is required", 400);

    const reqSet = await catalogRepository.getRequirementSet(requirementSetId);
    if (!reqSet) throw notFound("Requirement set");

    const profile = await profileRepository.get(user.id);
    if (!profile) throw new HttpError(400, "Complete your profile to check eligibility.");

    const report = evaluateEligibility(
      {
        educationHistory: (profile.educationHistory as never) ?? [],
        testScores: (profile.testScores as never) ?? {},
      },
      {
        minGpa: reqSet.minGpa ? Number(reqSet.minGpa) : null,
        gpaScale: reqSet.gpaScale ? Number(reqSet.gpaScale) : null,
        minIelts: reqSet.minIelts ? Number(reqSet.minIelts) : null,
        minToefl: reqSet.minToefl ? Number(reqSet.minToefl) : null,
        minPte: reqSet.minPte ? Number(reqSet.minPte) : null,
        minDuolingo: reqSet.minDuolingo ? Number(reqSet.minDuolingo) : null,
      },
    );
    return ok(report);
  });
}
