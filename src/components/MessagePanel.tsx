"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderUserId: string;
  sender: { email: string; role: string };
}

interface Props {
  applicationId: string;
  currentUserId: string;
}

export function MessagePanel({ applicationId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setMessages(await apiFetch<Message[]>(`/api/applications/${applicationId}/messages`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages.");
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/applications/${applicationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="max-h-72 space-y-3 overflow-y-auto">
        {messages.length === 0 && <p className="text-sm text-slate-400">No messages yet.</p>}
        {messages.map((m) => {
          const mine = m.senderUserId === currentUserId;
          return (
            <div key={m.id} className={mine ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.body}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {m.sender.email} · {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
