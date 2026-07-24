"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";
import { docTypeLabel } from "@/lib/labels";

interface Country { id: string; name: string }
interface University { id: string; name: string }
interface Program { id: string; name: string }

const DOC_TYPES = [
  "transcript",
  "english_test",
  "passport",
  "sop",
  "recommendation_letter",
  "cv",
  "financial_proof",
  "visa_document",
] as const;

interface DocRow {
  documentType: string;
  enabled: boolean;
  phase: "core" | "post_admission";
  required: boolean;
}

const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export default function RequirementsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [countryId, setCountryId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [programId, setProgramId] = useState("");
  const [intake, setIntake] = useState("Fall 2026");
  const [minGpa, setMinGpa] = useState("3.0");
  const [minIelts, setMinIelts] = useState("6.5");
  const [fee, setFee] = useState("100");
  const [docs, setDocs] = useState<DocRow[]>(
    DOC_TYPES.map((t) => ({
      documentType: t,
      enabled: ["transcript", "english_test", "passport", "sop"].includes(t),
      phase: t === "financial_proof" || t === "visa_document" ? "post_admission" : "core",
      required: true,
    })),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<Country[]>("/api/admin/catalog/countries").then(setCountries).catch(() => {});
  }, []);

  async function onCountry(id: string) {
    setCountryId(id);
    setUniversityId("");
    setProgramId("");
    setPrograms([]);
    setUniversities(id ? await apiFetch<University[]>(`/api/catalog/universities?countryId=${id}`) : []);
  }
  async function onUniversity(id: string) {
    setUniversityId(id);
    setProgramId("");
    setPrograms(id ? await apiFetch<Program[]>(`/api/catalog/programs?universityId=${id}`) : []);
  }

  function updateDoc(type: string, patch: Partial<DocRow>) {
    setDocs((rows) => rows.map((r) => (r.documentType === type ? { ...r, ...patch } : r)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const requiredDocuments = docs
      .filter((d) => d.enabled)
      .map((d) => ({ documentType: d.documentType, phase: d.phase, required: d.required }));
    if (!programId || requiredDocuments.length === 0) {
      setError("Pick a program and at least one document.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{ version: number }>("/api/admin/requirement-sets", {
        method: "POST",
        body: JSON.stringify({
          programId,
          intake,
          minGpa: Number(minGpa),
          gpaScale: 4,
          minIelts: Number(minIelts),
          applicationFee: Number(fee),
          requiredDocuments,
        }),
      });
      setStatus(`Requirement set saved (version ${res.version}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Requirement sets</h1>
      <p className="mt-1 text-sm text-slate-600">
        Saving creates a new version and supersedes the prior active one.
      </p>

      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select className={field} value={countryId} onChange={(e) => onCountry(e.target.value)} required>
            <option value="">Country…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className={field} value={universityId} onChange={(e) => onUniversity(e.target.value)} disabled={!universities.length} required>
            <option value="">University…</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select className={field} value={programId} onChange={(e) => setProgramId(e.target.value)} disabled={!programs.length} required>
            <option value="">Program…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <input className={field} placeholder="Intake" value={intake} onChange={(e) => setIntake(e.target.value)} required />
          <input className={field} type="number" step="0.1" placeholder="Min GPA (/4)" value={minGpa} onChange={(e) => setMinGpa(e.target.value)} />
          <input className={field} type="number" step="0.5" placeholder="Min IELTS" value={minIelts} onChange={(e) => setMinIelts(e.target.value)} />
          <input className={field} type="number" placeholder="Fee" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>

        <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Required documents</legend>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.documentType} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={(e) => updateDoc(d.documentType, { enabled: e.target.checked })}
                />
                <span className="w-52 text-slate-700">{docTypeLabel(d.documentType)}</span>
                <select
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={d.phase}
                  disabled={!d.enabled}
                  onChange={(e) => updateDoc(d.documentType, { phase: e.target.value as DocRow["phase"] })}
                >
                  <option value="core">Core (to apply)</option>
                  <option value="post_admission">Post-admission</option>
                </select>
              </div>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status && <p className="text-sm text-green-600">{status}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save requirement set"}
        </button>
      </form>
    </div>
  );
}
