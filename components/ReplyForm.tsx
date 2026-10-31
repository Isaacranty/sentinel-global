"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return null;

  if (!session) {
    return (
      <p className="text-sm text-text-muted mt-4">
        <Link href="/login" className="text-signal hover:underline">
          Log in
        </Link>{" "}
        to reply.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setError("Write something first.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/threads/${threadId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't post that — try again.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Reply as ${session.user?.name}…`}
        rows={2}
        className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-2 focus:outline-none focus:border-signal"
      />
      <button
        type="submit"
        disabled={submitting}
        className="font-mono text-xs uppercase tracking-wider bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
      >
        {submitting ? "…" : "Reply"}
      </button>
      {error && <p className="text-xs text-critical mt-2">{error}</p>}
    </form>
  );
}
