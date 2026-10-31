"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResolveReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"resolve" | "delete" | "dismiss" | null>(null);

  async function post(path: string, body?: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to update report");
    }
  }

  async function handleResolve(deleteContent: boolean) {
    setLoading(deleteContent ? "delete" : "resolve");
    try {
      await post(`/api/admin/reports/${reportId}/resolve`, { deleteContent });
    } finally {
      setLoading(null);
    }
  }

  async function handleDismiss() {
    setLoading("dismiss");
    try {
      await post(`/api/admin/reports/${reportId}/dismiss`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => handleResolve(true)}
        disabled={loading !== null}
        className="text-[10px] font-mono text-critical uppercase border border-critical/40 px-2 py-1 hover:bg-critical/10 transition-colors disabled:opacity-50"
      >
        {loading === "delete" ? "…" : "[Delete Content]"}
      </button>
      <button
        onClick={() => handleResolve(false)}
        disabled={loading !== null}
        className="text-[10px] font-mono text-signal uppercase border border-signal/40 px-2 py-1 hover:bg-signal/10 transition-colors disabled:opacity-50"
      >
        {loading === "resolve" ? "…" : "[Resolve]"}
      </button>
      <button
        onClick={handleDismiss}
        disabled={loading !== null}
        className="text-[10px] font-mono text-text-muted uppercase border border-panelLine px-2 py-1 hover:border-signal/60 hover:text-signal transition-colors disabled:opacity-50"
      >
        {loading === "dismiss" ? "…" : "[Dismiss]"}
      </button>
    </div>
  );
}
