"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReactionType = "UPVOTE" | "DOWNVOTE" | "SIGNAL" | "ALERT";

type Props = {
  threadId: string;
  initialCounts: Record<ReactionType, number>;
  userReactions: ReactionType[];
};

const ICONS: Record<ReactionType, string> = {
  UPVOTE: "▲",
  DOWNVOTE: "▼",
  SIGNAL: "📡",
  ALERT: "⚠️",
};

export default function ReactionButtons({ threadId, initialCounts, userReactions }: Props) {
  const router = useRouter();
  const [counts, setCounts] = useState(initialCounts);
  const [active, setActive] = useState(userReactions);
  const [loading, setLoading] = useState(false);

  async function handleReact(type: ReactionType) {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/threads/${threadId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const { reacted } = await res.json();
        setCounts(prev => ({
          ...prev,
          [type]: reacted ? prev[type] + 1 : prev[type] - 1
        }));
        setActive(prev => reacted ? [...prev, type] : prev.filter(t => t !== type));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      {(Object.keys(ICONS) as ReactionType[]).map(type => (
        <button
          key={type}
          onClick={() => handleReact(type)}
          disabled={loading}
          className={`px-2 py-1 border rounded-sm font-mono text-[10px] transition-colors flex items-center gap-1 ${
            active.includes(type)
              ? "bg-signal/20 border-signal text-signal"
              : "border-panelLine bg-panel text-text-muted hover:border-signal/60"
          }`}
        >
          <span>{ICONS[type]}</span>
          <span>{counts[type]}</span>
        </button>
      ))}

      <button
        onClick={async () => {
          const url = `${window.location.origin}/community/${threadId}`;
          if (navigator.share) {
            try {
              await navigator.share({
                title: 'Sentinel Global Signal',
                text: 'Check out this intelligence signal on Sentinel Global.',
                url: url,
              });
            } catch (err) {
              // Ignore abort errors
            }
          } else {
            navigator.clipboard.writeText(url);
            alert("Signal link copied to clipboard");
          }
        }}
        className="ml-auto px-2 py-1 border border-panelLine bg-panel text-text-muted hover:border-signal/60 rounded-sm font-mono text-[10px] uppercase transition-colors"
      >
        Share Signal
      </button>
    </div>
  );
}
