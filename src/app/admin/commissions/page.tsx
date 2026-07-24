"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";
import { Badge } from "@/components/Badge";

interface Commission {
  id: string;
  amount: number;
  currency: string;
  status: string;
  note: string | null;
  application: { id: string; program: { name: string }; student: { email: string } };
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [applicationId, setApplicationId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setCommissions(await apiFetch<Commission[]>("/api/admin/commissions"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load commissions.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/api/admin/commissions", {
        method: "POST",
        body: JSON.stringify({ applicationId, amount: Number(amount), currency: "USD" }),
      });
      setApplicationId("");
      setAmount("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record commission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Commissions</h1>

      <form onSubmit={create} className="mt-6 flex flex-wrap gap-2">
        <input
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          placeholder="Application ID"
          required
          className="w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (USD)"
          required
          className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Record
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <table className="mt-6 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">Student</th>
            <th className="px-4 py-2 font-medium">Program</th>
            <th className="px-4 py-2 font-medium">Amount</th>
            <th className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {commissions.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2 text-slate-700">{c.application.student.email}</td>
              <td className="px-4 py-2 text-slate-700">{c.application.program.name}</td>
              <td className="px-4 py-2 text-slate-700">
                {c.currency} {c.amount.toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <Badge tone={c.status === "paid" ? "green" : "neutral"}>{c.status}</Badge>
              </td>
            </tr>
          ))}
          {commissions.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-slate-400">
                No commissions recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
