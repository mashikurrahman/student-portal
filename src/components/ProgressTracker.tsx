import { stageMilestones, TERMINAL_STAGES } from "@/lib/stage";
import { stageLabel } from "@/lib/labels";

/** Horizontal stepper visualising where an application sits in its lifecycle. */
export function ProgressTracker({ stage }: { stage: string }) {
  const milestones = stageMilestones(stage);
  const terminal = TERMINAL_STAGES[stage];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      {terminal && (
        <p className="mb-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
          {stageLabel(stage)}
        </p>
      )}
      <ol className="flex items-center">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          const dot =
            m.state === "done"
              ? "bg-brand-600 text-white"
              : m.state === "current"
                ? "bg-brand-600 text-white ring-4 ring-brand-100"
                : "bg-slate-200 text-slate-500";
          const line = m.state === "done" ? "bg-brand-600" : "bg-slate-200";
          return (
            <li
              key={m.key}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${dot}`}
                >
                  {m.state === "done" ? "✓" : i + 1}
                </span>
                <span
                  className={`mt-2 whitespace-nowrap text-xs ${
                    m.state === "upcoming"
                      ? "text-slate-400"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {m.label}
                </span>
              </div>
              {!isLast && <span className={`mx-2 h-0.5 flex-1 ${line}`} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
