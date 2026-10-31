"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Instance = {
  id: string;
  status: string;
  secondsRemaining?: number;
  unlockedHints?: number[];
  currentXp?: number;
};

export default function ChallengeRunner({ challengeId, hints = [] }: { challengeId: string, hints?: { text: string; cost: number }[] }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [flagGuess, setFlagGuess] = useState("");
  const [result, setResult] = useState<"" | "correct" | "wrong">("");

  if (sessionStatus === "loading") return null;

  if (!session) {
    return (
      <div className="border border-panelLine bg-panel rounded-sm p-4 text-sm text-text-muted">
        <Link href={`/login?callbackUrl=/ctf/${challengeId}`} className="text-signal hover:underline">
          Log in
        </Link>{" "}
        to start this challenge.
      </div>
    );
  }

  async function start() {
    setStarting(true);
    setError("");
    try {
      const res = await fetch(`/api/ctf/${challengeId}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed to start");
      setInstance(data.instance);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("capacity")
          ? e.message
          : "Couldn't start the challenge — it may need its Docker image built first."
      );
    } finally {
      setStarting(false);
    }
  }

  async function stop() {
    if (!instance) return;
    setStarting(true);
    try {
      const res = await fetch(`/api/ctf/instance/${instance.id}/stop`, { method: "POST" });
      if (res.ok) {
        setInstance(null);
      }
    } catch (e) {
      console.error("Failed to stop instance", e);
    } finally {
      setStarting(false);
    }
  }

  // Poll status every 5s while an instance is active, to keep the
  // countdown and status in sync with what the server/orchestrator
  // actually did (container might error out, expire, etc.)
  useEffect(() => {
    if (!instance || instance.status === "stopped" || instance.status === "expired") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/ctf/instance/${instance.id}`);
      if (res.ok) {
        const data = await res.json();
        setInstance(data.instance);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [instance]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!instance) return;
    const res = await fetch(`/api/ctf/instance/${instance.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: flagGuess }),
    });
    const data = await res.json();
    setResult(data.correct ? "correct" : "wrong");
  }

  async function unlockHint(hintId: number) {
    if (!instance) return;
    try {
      const res = await fetch("/api/ctf/hints/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, hintId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
          const data = await res.json();
          alert(data.error || "Failed to unlock hint");
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!instance) {
    return (
      <div>
        <button
          onClick={start}
          disabled={starting}
          className="font-mono text-xs uppercase tracking-wider bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
        >
          {starting ? "Starting…" : "Start challenge"}
        </button>
        {error && <p className="text-xs text-critical mt-2">{error}</p>}
      </div>
    );
  }

  const minutes = Math.floor((instance.secondsRemaining ?? 0) / 60);
  const seconds = (instance.secondsRemaining ?? 0) % 60;

  return (
    <div className="border border-panelLine bg-panel rounded-sm p-4">
      <div className="flex items-center justify-between mb-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-signal uppercase">{instance.status}</span>
          {instance.status === "running" && (
            <button
              onClick={stop}
              disabled={starting}
              className="text-text-muted hover:text-critical transition-colors uppercase"
            >
              [Stop Instance]
            </button>
          )}
        </div>
        {instance.status === "running" && (
          <span className="text-text-muted">
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
          </span>
        )}
      </div>

      {instance.status === "running" && (
        <div className="mb-4">
          <p className="text-xs font-mono text-text-muted mb-2">
            Served through the app's own proxy — the container is never exposed directly.
          </p>
          {/* Deliberately no allow-scripts: since the proxy serves the
              challenge from this app's own origin, a challenge with
              allow-scripts + allow-same-origin could run JS with
              access to this page's origin. Fine for form-only
              challenges like example-sqli; a JS-requiring challenge
              needs a real cross-origin iframe (subdomain-per-instance)
              instead, not scripts enabled here. */}
          <iframe
            src={`/api/ctf/instance/${instance.id}/proxy`}
            className="w-full h-96 border border-panelLine rounded-sm bg-white"
            sandbox="allow-forms allow-same-origin"
            title="Challenge"
          />
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={flagGuess}
          onChange={(e) => setFlagGuess(e.target.value)}
          placeholder="SENTINEL{...}"
          className="flex-1 bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-signal"
        />
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-wider bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors"
        >
          Submit
        </button>
      </form>
      {result === "correct" && (
        <p className="text-signal text-sm font-mono mt-2">Correct — challenge solved.</p>
      )}
      {result === "wrong" && (
        <p className="text-critical text-sm font-mono mt-2">Not quite — try again.</p>
      )}

      {hints.length > 0 && (
          <div className="mt-8 pt-6 border-t border-panelLine">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">Intel Support (Hints)</h4>
              <div className="space-y-3">
                  {hints.map((hint, i) => {
                      const isUnlocked = instance.unlockedHints?.includes(i);
                      return (
                          <div key={i} className="bg-ink/50 border border-panelLine rounded-sm p-3">
                              {isUnlocked ? (
                                  <p className="text-xs text-text leading-relaxed font-mono">
                                      <span className="text-signal mr-2">HINT {i+1}:</span>
                                      {hint.text}
                                  </p>
                              ) : (
                                  <div className="flex items-center justify-between">
                                      <p className="text-xs text-text-muted font-mono italic">Encryption locked...</p>
                                      <button
                                        onClick={() => unlockHint(i)}
                                        className="text-[10px] font-mono uppercase bg-panel border border-panelLine px-3 py-1 hover:border-signal/60 transition-colors"
                                      >
                                          Unlock Intel ({hint.cost} XP)
                                      </button>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
}
