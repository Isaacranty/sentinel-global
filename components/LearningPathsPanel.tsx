"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LearningPath } from "@/lib/learningPaths";
import LearningPathCard from "@/components/LearningPathCard";

export default function LearningPathsPanel({ paths }: { paths: LearningPath[] }) {
  const { data: session, status } = useSession();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoaded(true);
      return;
    }
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        setCompleted(new Set(data.completed ?? []));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [session]);

  async function handleToggle(pathId: string, resourceUrl: string) {
    // Optimistic update — flip it locally immediately, then reconcile
    // with what the server actually recorded.
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(resourceUrl) ? next.delete(resourceUrl) : next.add(resourceUrl);
      return next;
    });

    try {
      const res = await fetch("/api/progress/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId, resourceUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCompleted((prev) => {
        const next = new Set(prev);
        data.completed ? next.add(resourceUrl) : next.delete(resourceUrl);
        return next;
      });
    } catch {
      // Revert on failure
      setCompleted((prev) => {
        const next = new Set(prev);
        next.has(resourceUrl) ? next.delete(resourceUrl) : next.add(resourceUrl);
        return next;
      });
    }
  }

  return (
    <div>
      {status !== "loading" && !session && (
        <p className="text-xs text-text-muted mb-3">
          <Link href="/login?callbackUrl=/" className="text-signal hover:underline">
            Log in
          </Link>{" "}
          to track your progress.
        </p>
      )}
      <div className="grid gap-3">
        {paths.map((path) => (
          <LearningPathCard
            key={path.id}
            path={path}
            completed={loaded ? completed : new Set()}
            onToggle={handleToggle}
            showCheckboxes={!!session}
          />
        ))}
      </div>
    </div>
  );
}
