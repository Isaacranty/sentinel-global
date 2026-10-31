"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  threadId: string;
  isVerified: boolean;
};

export default function VerifyButton({ threadId, isVerified }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/verify`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-2 py-1 border rounded-sm font-mono text-[10px] uppercase transition-colors ${
        isVerified
          ? "bg-signal border-signal text-ink"
          : "border-panelLine text-text-muted hover:text-signal hover:border-signal/60"
      }`}
    >
      {loading ? "..." : isVerified ? "✓ Verified" : "Verify Signal"}
    </button>
  );
}
