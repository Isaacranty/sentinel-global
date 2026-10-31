"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  threadId?: string;
  newsUrl?: string;
  title: string;
  isBookmarked: boolean;
};

export default function BookmarkButton({ threadId, newsUrl, title, isBookmarked }: Props) {
  const router = useRouter();
  const [active, setActive] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, newsUrl, title }),
      });

      if (res.ok) {
        const { bookmarked } = await res.json();
        setActive(bookmarked);
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
      className={`text-[10px] font-mono uppercase transition-colors ${
        active ? "text-signal" : "text-text-muted hover:text-signal"
      }`}
    >
      {active ? "[★ Saved]" : "[☆ Save]"}
    </button>
  );
}
