"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/http";
import { Badge, eligibilityTone } from "@/components/Badge";
import { ELIGIBILITY_LABELS } from "@/lib/labels";

interface Country { id: string; name: string }
interface University { id: string; name: string; city: string | null }
interface RequirementSet {
  id: string;
  intake: string;
  minGpa: string | null;
  minIelts: string | null;
  applicationFee: number;
}
interface Program {
  id: string;
  name: string;
  degreeLevel: string;
  discipline: string;
  tuitionAnnual: number;
  requirementSets: RequirementSet[];
}
interface EligibilityReport { result: string; reasons: string[] }

export function BrowseExplorer() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [countryId, setCountryId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [eligibility, setEligibility] = useState<Record<string, EligibilityReport>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Country[]>("/api/catalog/countries").then(setCountries).catch(() => {});
  }, []);

  async function onCountry(id: string) {
    setCountryId(id);
    setUniversityId("");
    setPrograms([]);
    setUniversities([]);
    if (!id) return;
    setUniversities(await apiFetch<University[]>(`/api/catalog/universities?countryId=${id}`));
  }

  async function onUniversity(id: string) {
    setUniversityId(id);
    setPrograms([]);
    if (!id) return;
    setPrograms(await apiFetch<Program[]>(`/api/catalog/programs?universityId=${id}`));
  }

  async function checkEligibility(reqSetId: string) {
    setError(null);
    setBusy(reqSetId);
    try {
      const report = await apiFetch<EligibilityReport>(`/api/eligibility?requirementSetId=${reqSetId}`);
      setEligibility((prev) => ({ ...prev, [reqSetId]: report }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check eligibility.");
    } finally {
      setBusy(null);
    }
  }

  async function apply(reqSetId: string) {
    setError(null);
    setBusy(reqSetId);
    try {
      const app = await apiFetch<{ id: string }>("/api/applications", {
        method: "POST",
        body: JSON.stringify({ requirementSetId: reqSetId }),
      });
      router.push(`/student/applications/${app.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create application.");
      setBusy(null);
    }
  }

  const select = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Country</span>
          <select className={select} value={countryId} onChange={(e) => onCountry(e.target.value)}>
            <option value="">Select a country…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">University</span>
          <select className={select} value={universityId} onChange={(e) => onUniversity(e.target.value)} disabled={!universities.length}>
            <option value="">Select a university…</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {programs.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {p.discipline} · {p.degreeLevel} · ${p.tuitionAnnual.toLocaleString()}/yr
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {p.requirementSets.map((rs) => {
                const report = eligibility[rs.id];
                return (
                  <div key={rs.id} className="rounded-md bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">{rs.intake}</span>
                        {rs.minGpa && <> · min GPA {rs.minGpa}</>}
                        {rs.minIelts && <> · IELTS {rs.minIelts}</>}
                        {rs.applicationFee > 0 && <> · fee ${rs.applicationFee}</>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => checkEligibility(rs.id)}
                          disabled={busy === rs.id}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
                        >
                          Check eligibility
                        </button>
                        <button
                          onClick={() => apply(rs.id)}
                          disabled={busy === rs.id}
                          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    {report && (
                      <div className="mt-3">
                        <Badge tone={eligibilityTone(report.result)}>
                          {ELIGIBILITY_LABELS[report.result]}
                        </Badge>
                        <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
                          {report.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {universityId && programs.length === 0 && (
          <p className="text-sm text-slate-500">No active programs for this university yet.</p>
        )}
      </div>
    </div>
  );
}
