"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";

interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
  actor: { email: string; role: string } | null;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<AuditEntry[]>("/api/admin/audit")
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load audit log."));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Audit log</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <table className="mt-6 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">When</th>
            <th className="px-4 py-2 font-medium">Actor</th>
            <th className="px-4 py-2 font-medium">Action</th>
            <th className="px-4 py-2 font-medium">Resource</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                {new Date(e.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-slate-700">{e.actor?.email ?? "system"}</td>
              <td className="px-4 py-2 font-mono text-xs text-slate-700">{e.action}</td>
              <td className="px-4 py-2 text-slate-500">
                {e.resourceType}
                {e.resourceId ? `:${e.resourceId.slice(0, 8)}` : ""}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-slate-400">
                No audit entries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
