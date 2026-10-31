"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveButton({ writeUpId }: { writeUpId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ctf/writeups/${writeUpId}/approve`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-[10px] font-mono text-signal uppercase border border-signal/40 px-2 py-1 hover:bg-signal/10 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "[Approve]"}
    </button>
  );
}
