"use client";

import { useState, useRef } from "react";

type Props = {
  endpoint: string; // e.g. /api/threads/{id}/report or /api/threads/{id}/replies/{replyId}/report
};

export default function ReportButton({ endpoint }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("reason", reason.trim());
      if (fileRef.current?.files?.[0]) {
        formData.append("evidence", fileRef.current.files[0]);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to report");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return <span className="text-[10px] font-mono text-text-muted uppercase">Reported</span>;
  }

  if (open) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason…"
            autoFocus
            className="bg-ink border border-panelLine rounded-sm px-2 py-1 text-[10px] font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-critical w-32"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[10px] font-mono text-text-muted hover:underline uppercase"
          >
            {fileName ? "✓ Evidence" : "+Evidence"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
            className="hidden"
          />
          <button
            onClick={handleSubmit}
            disabled={sending || !reason.trim()}
            className="text-[10px] font-mono text-critical hover:underline uppercase disabled:opacity-50"
          >
            {sending ? "…" : "Send"}
          </button>
          <button
            onClick={() => setOpen(false)}
            disabled={sending}
            className="text-[10px] font-mono text-text-muted hover:underline uppercase"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="text-[10px] font-mono text-text-muted hover:text-critical transition-colors uppercase"
    >
      [Report]
    </button>
  );
}
