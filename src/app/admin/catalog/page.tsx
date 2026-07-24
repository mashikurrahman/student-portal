"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";

interface Country {
  id: string;
  name: string;
  isoCode: string;
}
interface University {
  id: string;
  name: string;
}

const card = "rounded-lg border border-slate-200 bg-white p-5";
const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";
const btn =
  "rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50";

export default function CatalogPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);

  // country form
  const [cName, setCName] = useState("");
  const [cIso, setCIso] = useState("");
  // university form
  const [uCountry, setUCountry] = useState("");
  const [uName, setUName] = useState("");
  const [uCity, setUCity] = useState("");
  // program form
  const [pUniversity, setPUniversity] = useState("");
  const [pName, setPName] = useState("");
  const [pDiscipline, setPDiscipline] = useState("");
  const [pLevel, setPLevel] = useState("master");
  const [pDuration, setPDuration] = useState("24");
  const [pTuition, setPTuition] = useState("30000");

  async function loadCountries() {
    setCountries(await apiFetch<Country[]>("/api/admin/catalog/countries"));
  }
  useEffect(() => {
    loadCountries().catch((e) => setError(e instanceof Error ? e.message : "Load failed."));
  }, []);

  async function loadUniversities(countryId: string) {
    if (!countryId) return setUniversities([]);
    setUniversities(await apiFetch<University[]>(`/api/catalog/universities?countryId=${countryId}`));
  }

  async function submit(e: FormEvent, url: string, payload: unknown, reset: () => void) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Catalog</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form
          className={card}
          onSubmit={(e) =>
            submit(e, "/api/admin/catalog/countries", { name: cName, isoCode: cIso }, () => {
              setCName("");
              setCIso("");
              loadCountries();
            })
          }
        >
          <h2 className="font-semibold text-slate-900">Add country</h2>
          <div className="mt-3 space-y-2">
            <input className={field} placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} required />
            <input className={field} placeholder="ISO code (e.g. CA)" value={cIso} onChange={(e) => setCIso(e.target.value)} maxLength={2} required />
            <button className={btn}>Add country</button>
          </div>
        </form>

        <form
          className={card}
          onSubmit={(e) =>
            submit(
              e,
              "/api/admin/catalog/universities",
              { countryId: uCountry, name: uName, city: uCity || undefined },
              () => {
                setUName("");
                setUCity("");
                loadUniversities(uCountry);
              },
            )
          }
        >
          <h2 className="font-semibold text-slate-900">Add university</h2>
          <div className="mt-3 space-y-2">
            <select
              className={field}
              value={uCountry}
              onChange={(e) => {
                setUCountry(e.target.value);
                loadUniversities(e.target.value);
              }}
              required
            >
              <option value="">Country…</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input className={field} placeholder="University name" value={uName} onChange={(e) => setUName(e.target.value)} required />
            <input className={field} placeholder="City" value={uCity} onChange={(e) => setUCity(e.target.value)} />
            <button className={btn}>Add university</button>
          </div>
        </form>

        <form
          className={card}
          onSubmit={(e) =>
            submit(
              e,
              "/api/admin/catalog/programs",
              {
                universityId: pUniversity,
                name: pName,
                discipline: pDiscipline,
                degreeLevel: pLevel,
                durationMonths: Number(pDuration),
                tuitionAnnual: Number(pTuition),
              },
              () => {
                setPName("");
                setPDiscipline("");
              },
            )
          }
        >
          <h2 className="font-semibold text-slate-900">Add program</h2>
          <div className="mt-3 space-y-2">
            <select className={field} value={pUniversity} onChange={(e) => setPUniversity(e.target.value)} required>
              <option value="">University (pick a country above first)…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <input className={field} placeholder="Program name" value={pName} onChange={(e) => setPName(e.target.value)} required />
            <input className={field} placeholder="Discipline" value={pDiscipline} onChange={(e) => setPDiscipline(e.target.value)} required />
            <select className={field} value={pLevel} onChange={(e) => setPLevel(e.target.value)}>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
              <option value="diploma">Diploma</option>
            </select>
            <div className="flex gap-2">
              <input className={field} type="number" placeholder="Months" value={pDuration} onChange={(e) => setPDuration(e.target.value)} />
              <input className={field} type="number" placeholder="Tuition/yr" value={pTuition} onChange={(e) => setPTuition(e.target.value)} />
            </div>
            <button className={btn}>Add program</button>
          </div>
        </form>
      </div>
    </div>
  );
}
