"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ThreadContext } from "@/lib/threadsStore";

export default function NewThreadForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();

  const prefillTitle = params.get("title") || "";
  const refUrl = params.get("refUrl");
  const refTitle = params.get("refTitle");
  const isPathContext = params.get("context") === "path";
  const isNewsContext = params.get("context") === "news";

  const [title, setTitle] = useState(prefillTitle);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="border border-panelLine bg-panel rounded-sm p-4 mb-6 text-sm text-text-muted">
        <Link href={`/login?callbackUrl=/community`} className="text-signal hover:underline">
          Log in
        </Link>{" "}
        to start a thread.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Give it a title and a first message.");
      return;
    }
    setSubmitting(true);
    setError("");

    let context: ThreadContext = { type: "general" };
    if (isNewsContext && refUrl && refTitle) {
      context = { type: "news", refTitle, refUrl };
    } else if (isPathContext && refTitle) {
      context = { type: "path", refTitle };
    }

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, context }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't post that — try again.");
      return;
    }
    setTitle("");
    setBody("");
    router.push("/community");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-panelLine bg-panel rounded-sm p-4 mb-6"
    >
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
        Start a thread — posting as {session.user?.name}
      </h2>
      {refTitle && (
        <p className="text-xs font-mono text-signal mb-2">
          Attached to: {refTitle}
        </p>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thread title"
        className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-2 focus:outline-none focus:border-signal"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What do you want to discuss?"
        rows={3}
        className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-3 focus:outline-none focus:border-signal"
      />
      {error && <p className="text-xs text-critical mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="font-mono text-xs uppercase tracking-wider bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post thread"}
      </button>
    </form>
  );
}
