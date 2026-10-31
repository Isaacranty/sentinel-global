"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SquadManager() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Failed to commission squad.");
      }
    } catch (err) {
      setError("Communication failure with Central Command.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Failed to join squad. Check invite code.");
      }
    } catch (err) {
      setError("Communication failure with Central Command.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex border-b border-panelLine mb-8">
        <button
          onClick={() => setMode("create")}
          className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'create' ? 'text-signal border-b-2 border-signal' : 'text-text-muted hover:text-text'}`}
        >
          Commission Unit
        </button>
        <button
          onClick={() => setMode("join")}
          className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'join' ? 'text-signal border-b-2 border-signal' : 'text-text-muted hover:text-text'}`}
        >
          Join Squad
        </button>
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Squad Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Shadow Vanguard"
              className="w-full bg-panel border border-panelLine rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-signal"
              required
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Operational Objective</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the unit's specialty..."
              rows={3}
              className="w-full bg-panel border border-panelLine rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-signal"
            />
          </div>
          {error && <p className="text-critical text-[10px] font-mono uppercase">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-signal text-ink font-mono font-bold uppercase py-3 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
          >
            {loading ? "COMMISSIONING..." : "COMMISSION UNIT"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Invite Code</label>
            <input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="ENTER 6-DIGIT CODE"
              className="w-full bg-panel border border-panelLine rounded-sm px-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-signal text-center"
              required
            />
          </div>
          {error && <p className="text-critical text-[10px] font-mono uppercase">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-signal text-ink font-mono font-bold uppercase py-3 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
          >
            {loading ? "LINKING..." : "JOIN SQUAD"}
          </button>
        </form>
      )}
    </div>
  );
}
