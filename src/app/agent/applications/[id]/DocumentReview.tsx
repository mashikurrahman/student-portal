"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/http";

interface Props {
  applicationId: string;
  documentId: string;
  disabled: boolean;
}

type Mode = "idle" | "reject" | "request_reupload";

export function DocumentReview({ applicationId, documentId, disabled }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "approve" | "reject" | "request_reupload", withReason?: string) {
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/api/agent/applications/${applicationId}/documents/${documentId}/review`, {
        method: "POST",
        body: JSON.stringify({ action, reason: withReason }),
      });
      setMode("idle");
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setBusy(false);
    }
  }

  if (disabled) {
    return <span className="text-xs text-slate-400">Start review to act</span>;
  }

  if (mode !== "idle") {
    return (
      <div className="flex flex-col items-end gap-2">
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for the student…"
          className="w-64 rounded-md border border-slate-300 px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={() => decide(mode, reason)}
            disabled={busy || reason.trim().length === 0}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            Confirm
          </button>
          <button onClick={() => setMode("idle")} className="text-xs text-slate-500">
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => decide("approve")}
        disabled={busy}
        className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => setMode("request_reupload")}
        className="rounded-md border border-amber-400 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
      >
        Re-upload
      </button>
      <button
        onClick={() => setMode("reject")}
        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Reject
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
