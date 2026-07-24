"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";

interface Agent {
  id: string;
  email: string;
}
interface Student {
  id: string;
  email: string;
  profile: { fullName: string } | null;
  studentAssignments: { agentUserId: string; agent: { email: string } }[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    try {
      const [s, a] = await Promise.all([
        apiFetch<Student[]>("/api/admin/students"),
        apiFetch<Agent[]>("/api/admin/agents"),
      ]);
      setStudents(s);
      setAgents(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function assign(studentUserId: string, agentUserId: string) {
    if (!agentUserId) return;
    setSavingId(studentUserId);
    setError(null);
    try {
      await apiFetch("/api/admin/assignments", {
        method: "POST",
        body: JSON.stringify({ studentUserId, agentUserId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Students</h1>
      <p className="mt-1 text-sm text-slate-600">Assign each student to an agent.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {students.map((s) => {
          const current = s.studentAssignments[0]?.agentUserId ?? "";
          return (
            <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium text-slate-800">{s.profile?.fullName ?? s.email}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
              <select
                value={current}
                disabled={savingId === s.id}
                onChange={(e) => assign(s.id, e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              >
                <option value="">Unassigned…</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.email}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
        {students.length === 0 && (
          <li className="px-5 py-4 text-sm text-slate-400">No students yet.</li>
        )}
      </ul>
    </div>
  );
}
