"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/http";

interface Props {
  applicationId: string;
  disabled: boolean;
}

export function SubmitApplication({ applicationId, disabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/api/applications/${applicationId}/submit`, { method: "POST" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={submit}
        disabled={disabled || busy}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit to my agent"}
      </button>
      {disabled && (
        <p className="mt-2 text-xs text-slate-500">
          Upload all required documents to enable submission.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
