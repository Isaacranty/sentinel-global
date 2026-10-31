"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  userId: string;
  isBanned: boolean;
};

export default function BanButton({ userId, isBanned }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        router.refresh();
        setConfirming(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update ban status");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (isBanned) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="text-[10px] font-mono text-signal hover:underline uppercase disabled:opacity-50"
      >
        {loading ? "…" : "[Unban]"}
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          autoFocus
          className="bg-ink border border-panelLine rounded-sm px-2 py-1 text-[10px] font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-critical w-28"
        />
        <button
          onClick={handleToggle}
          disabled={loading}
          className="text-[10px] font-mono text-critical hover:underline uppercase disabled:opacity-50"
        >
          {loading ? "…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-[10px] font-mono text-text-muted hover:underline uppercase"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] font-mono text-text-muted hover:text-critical transition-colors uppercase"
    >
      [Ban]
    </button>
  );
}
