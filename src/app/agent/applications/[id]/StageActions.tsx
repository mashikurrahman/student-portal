"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/http";
import type { AgentTransitionInput } from "@/lib/validation/schemas";

type Action = AgentTransitionInput["action"];

interface ActionButton {
  action: Action;
  label: string;
  tone?: "primary" | "danger";
  needsReference?: boolean;
}

// Which agent actions are offered at each stage.
const STAGE_ACTIONS: Record<string, ActionButton[]> = {
  ready_for_review: [{ action: "start_review", label: "Start review", tone: "primary" }],
  under_agent_review: [
    { action: "submit_to_university", label: "Submit to university", tone: "primary", needsReference: true },
    { action: "request_changes", label: "Request document changes" },
  ],
  submitted_to_university: [
    { action: "mark_university_reviewing", label: "Mark as under university review", tone: "primary" },
  ],
  university_reviewing: [
    { action: "record_offer", label: "Record offer", tone: "primary" },
    { action: "record_rejection", label: "Record rejection", tone: "danger" },
  ],
  accepted: [{ action: "mark_enrolled", label: "Mark as enrolled", tone: "primary" }],
};

export function StageActions({ applicationId, stage }: { applicationId: string; stage: string }) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = STAGE_ACTIONS[stage] ?? [];
  if (actions.length === 0) {
    return <p className="text-sm text-slate-500">No actions available at this stage.</p>;
  }

  async function run(btn: ActionButton) {
    setError(null);
    if (btn.needsReference && reference.trim().length === 0) {
      setError("Enter the university application reference first.");
      return;
    }
    setBusy(btn.action);
    try {
      await apiFetch(`/api/agent/applications/${applicationId}/transition`, {
        method: "POST",
        body: JSON.stringify({ action: btn.action, reference: reference || undefined }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  const needsRef = actions.some((a) => a.needsReference);

  return (
    <div className="space-y-3">
      {needsRef && (
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="University application reference"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((btn) => (
          <button
            key={btn.action}
            onClick={() => run(btn)}
            disabled={busy !== null}
            className={
              btn.tone === "primary"
                ? "rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                : btn.tone === "danger"
                  ? "rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  : "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            }
          >
            {busy === btn.action ? "Working…" : btn.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
