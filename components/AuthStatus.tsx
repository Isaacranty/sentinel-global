"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") return null;

  if (!session) {
    return (
      <Link
        href="/login"
        className="font-mono text-xs uppercase tracking-wider text-signal border border-signal/40 rounded-sm px-3 py-1.5 hover:bg-signal/10 transition-colors"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="flex items-center gap-2 font-mono text-xs text-text-muted hover:text-signal transition-colors"
      >
        {session.user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.avatarUrl}
            alt=""
            className="w-6 h-6 rounded-full object-cover border border-panelLine"
          />
        ) : null}
        {session.user?.name}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="font-mono text-xs uppercase tracking-wider text-text-muted border border-panelLine rounded-sm px-3 py-1.5 hover:border-signal/60 hover:text-signal transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
