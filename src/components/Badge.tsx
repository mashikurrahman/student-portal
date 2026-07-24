type Tone = "neutral" | "green" | "amber" | "red" | "blue";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-brand-100 text-brand-700",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function eligibilityTone(result: string): Tone {
  if (result === "eligible") return "green";
  if (result === "borderline") return "amber";
  return "red";
}

export function statusTone(status: string): Tone {
  if (status === "approved") return "green";
  if (status === "rejected") return "red";
  if (status === "reupload_requested") return "amber";
  if (status === "pending") return "blue";
  return "neutral";
}
