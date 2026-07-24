import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { profileRepository } from "@/server/repositories/profile.repository";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

interface EducationEntry {
  level: string;
  institution: string;
  gpa: number;
  gpaScale: number;
  year: number;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const profile = session?.user?.id ? await profileRepository.get(session.user.id) : null;

  const education = ((profile?.educationHistory as EducationEntry[] | null) ?? []).map((e) => ({
    level: e.level,
    institution: e.institution,
    gpa: String(e.gpa),
    gpaScale: String(e.gpaScale),
    year: String(e.year),
  }));
  const scores = (profile?.testScores as { ielts?: number; toefl?: number } | null) ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Your academic background and test scores power eligibility checks.
      </p>
      <ProfileForm
        initial={{
          fullName: profile?.fullName ?? "",
          nationality: profile?.nationality ?? "",
          targetIntake: profile?.targetIntake ?? "",
          budgetAnnual: profile?.budgetAnnual ? String(profile.budgetAnnual) : "",
          ielts: scores.ielts ? String(scores.ielts) : "",
          toefl: scores.toefl ? String(scores.toefl) : "",
          education,
        }}
      />
    </div>
  );
}
