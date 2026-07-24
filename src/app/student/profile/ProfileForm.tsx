"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/http";
import type { ProfileUpdateInput } from "@/lib/validation/schemas";

interface EducationRow {
  level: string;
  institution: string;
  gpa: string;
  gpaScale: string;
  year: string;
}

interface Props {
  initial: {
    fullName: string;
    nationality: string;
    targetIntake: string;
    budgetAnnual: string;
    ielts: string;
    toefl: string;
    education: EducationRow[];
  };
}

export function ProfileForm({ initial }: Props) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [nationality, setNationality] = useState(initial.nationality);
  const [targetIntake, setTargetIntake] = useState(initial.targetIntake);
  const [budgetAnnual, setBudgetAnnual] = useState(initial.budgetAnnual);
  const [ielts, setIelts] = useState(initial.ielts);
  const [toefl, setToefl] = useState(initial.toefl);
  const [education, setEducation] = useState<EducationRow[]>(
    initial.education.length > 0
      ? initial.education
      : [{ level: "bachelor", institution: "", gpa: "", gpaScale: "4", year: "" }],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateRow(index: number, patch: Partial<EducationRow>) {
    setEducation((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSaving(true);

    const testScores: ProfileUpdateInput["testScores"] = {};
    if (ielts) testScores.ielts = Number(ielts);
    if (toefl) testScores.toefl = Number(toefl);

    const payload: ProfileUpdateInput = {
      fullName,
      nationality: nationality || undefined,
      targetIntake: targetIntake || undefined,
      budgetAnnual: budgetAnnual ? Number(budgetAnnual) : undefined,
      testScores,
      educationHistory: education
        .filter((r) => r.institution && r.gpa)
        .map((r) => ({
          level: r.level,
          institution: r.institution,
          gpa: Number(r.gpa),
          gpaScale: Number(r.gpaScale),
          year: Number(r.year) || new Date().getFullYear(),
        })),
    };

    try {
      await apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(payload) });
      setStatus("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Full name</span>
          <input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Nationality</span>
          <input className={field} value={nationality} onChange={(e) => setNationality(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Target intake</span>
          <input className={field} value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)} placeholder="Fall 2026" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Annual budget (USD)</span>
          <input className={field} type="number" value={budgetAnnual} onChange={(e) => setBudgetAnnual(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">IELTS</span>
          <input className={field} type="number" step="0.5" value={ielts} onChange={(e) => setIelts(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">TOEFL</span>
          <input className={field} type="number" value={toefl} onChange={(e) => setToefl(e.target.value)} />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Education history</legend>
        {education.map((row, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-5">
            <input className={field} placeholder="Institution" value={row.institution} onChange={(e) => updateRow(i, { institution: e.target.value })} />
            <input className={field} placeholder="Level" value={row.level} onChange={(e) => updateRow(i, { level: e.target.value })} />
            <input className={field} placeholder="GPA" type="number" step="0.1" value={row.gpa} onChange={(e) => updateRow(i, { gpa: e.target.value })} />
            <input className={field} placeholder="Scale" type="number" step="0.1" value={row.gpaScale} onChange={(e) => updateRow(i, { gpaScale: e.target.value })} />
            <input className={field} placeholder="Year" type="number" value={row.year} onChange={(e) => updateRow(i, { year: e.target.value })} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEducation((r) => [...r, { level: "bachelor", institution: "", gpa: "", gpaScale: "4", year: "" }])}
          className="text-sm font-medium text-brand-600"
        >
          + Add another qualification
        </button>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status && <p className="text-sm text-green-600">{status}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
