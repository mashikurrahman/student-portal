"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";
import { Badge } from "@/components/Badge";

interface Agent {
  id: string;
  email: string;
  status: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setAgents(await apiFetch<Agent[]>("/api/admin/agents"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTempPassword(null);
    setBusy(true);
    try {
      const res = await apiFetch<{ user: Agent; tempPassword: string }>("/api/admin/agents", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setTempPassword(res.tempPassword);
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite agent.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(agent: Agent) {
    const status = agent.status === "disabled" ? "active" : "disabled";
    try {
      await apiFetch(`/api/admin/agents/${agent.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Agents</h1>

      <form onSubmit={invite} className="mt-6 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@example.com"
          className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Invite agent
        </button>
      </form>

      {tempPassword && (
        <div className="mt-3 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Agent created. Share this one-time password securely:{" "}
          <code className="font-mono font-semibold">{tempPassword}</code>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {agents.map((a) => (
          <li key={a.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-800">{a.email}</span>
              <Badge tone={a.status === "active" ? "green" : "neutral"}>{a.status}</Badge>
            </div>
            <button onClick={() => toggle(a)} className="text-sm font-medium text-brand-600">
              {a.status === "disabled" ? "Enable" : "Disable"}
            </button>
          </li>
        ))}
        {agents.length === 0 && <li className="px-5 py-4 text-sm text-slate-400">No agents yet.</li>}
      </ul>
    </div>
  );
}
