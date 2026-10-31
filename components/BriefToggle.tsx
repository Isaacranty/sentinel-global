"use client";

import { useState } from "react";

export default function BriefToggle({ initialStatus }: { initialStatus: boolean }) {
  const [subscribed, setSubscribed] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newStatus = !subscribed;
    try {
      const res = await fetch("/api/user/brief-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: newStatus }),
      });
      if (res.ok) {
        setSubscribed(newStatus);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-panelLine bg-panel/20 rounded-sm">
      <div>
        <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-1">Intelligence Delivery</h4>
        <p className="text-[10px] text-text-muted font-mono">Receive the daily tactical brief via encrypted email.</p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-4 py-1.5 font-mono text-[10px] uppercase rounded-sm border transition-all ${subscribed ? 'bg-signal/10 border-signal text-signal' : 'border-panelLine text-text-muted hover:border-text-muted/60'}`}
      >
        {loading ? "Syncing..." : subscribed ? "Subscribed" : "Opt-In"}
      </button>
    </div>
  );
}
