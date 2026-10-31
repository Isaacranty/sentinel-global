"use client";

import { useState, useRef } from "react";

export default function WriteUpForm({ challengeId }: { challengeId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("challengeId", challengeId);
      formData.append("title", title);
      formData.append("content", content);
      if (fileRef.current?.files?.[0]) {
        formData.append("attachment", fileRef.current.files[0]);
      }

      const res = await fetch("/api/ctf/writeups/submit", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit write-up");
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
      return (
          <div className="bg-signal/10 border border-signal p-4 rounded-sm">
              <p className="text-signal text-xs font-mono font-bold">✓ MISSION REPORT SUBMITTED</p>
              <p className="text-text-muted text-[10px] font-mono mt-1">Thank you for contributing to the global knowledge base, operator.</p>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel border border-panelLine p-6 rounded-sm mt-8">
      <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">Submit Mission Report (Write-up)</h4>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Report Title (e.g., Solving via SQLi)"
        className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-3 focus:outline-none focus:border-signal"
        required
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Explain your methodology..."
        rows={5}
        className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-4 focus:outline-none focus:border-signal font-mono"
        required
      />

      <div className="mb-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[10px] font-mono uppercase tracking-wider text-text-muted border border-panelLine px-3 py-1.5 rounded-sm hover:border-signal/60 transition-colors"
        >
          {fileName ? `Attached: ${fileName}` : "Attach Screenshot / File (optional)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain"
          onChange={e => setFileName(e.target.files?.[0]?.name || null)}
          className="hidden"
        />
      </div>

      {error && <p className="text-[10px] font-mono text-critical mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-signal text-ink font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-sm font-bold hover:bg-signal/80 transition-colors"
      >
        {submitting ? "Transmitting..." : "Submit Report"}
      </button>
    </form>
  );
}
