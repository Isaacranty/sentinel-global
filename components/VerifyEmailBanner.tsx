"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function VerifyEmailBanner() {
  const { data: session, status } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "authenticated" || dismissed) return null;
  if (session?.user?.emailVerified) return null;

  async function handleResend() {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) setSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-alert/10 border-b border-alert/30 px-6 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-alert">
          {sent
            ? "Verification link sent — check your inbox."
            : "Verify your email to secure your account."}
        </p>
        <div className="flex items-center gap-3">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="font-mono text-[10px] uppercase tracking-widest text-alert hover:underline disabled:opacity-50"
            >
              {sending ? "Sending…" : "Resend link"}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-text"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
