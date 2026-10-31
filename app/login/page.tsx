"use client";

import { signIn, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const verify = params.get("verify");
  const oauthError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    oauthError === "AccessDenied"
      ? "This account has been suspended. Contact an admin if you think that's wrong."
      : oauthError
      ? "Couldn't sign in with that provider. Try again."
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getProviders().then((providers) => {
      if (!providers) return;
      setOauthProviders(
        Object.values(providers).filter((p) => p.id !== "credentials")
      );
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);
    if (res?.error) {
      if (res.error === "banned") {
        setError("This account has been suspended. Contact an admin if you think that's wrong.");
      } else {
        setError("Wrong email or password.");
      }
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-panelLine bg-panel rounded-sm p-6"
      >
        <h1 className="font-mono text-lg mb-1">
          SENTINEL<span className="text-signal">_GLOBAL</span>
        </h1>
        <p className="text-text-muted text-sm mb-6">Log in</p>

        {verify === "success" && (
          <p className="text-xs text-signal mb-3">Email verified — you're all set.</p>
        )}
        {verify === "invalid" && (
          <p className="text-xs text-critical mb-3">That verification link is invalid or already used.</p>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-2 focus:outline-none focus:border-signal"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full bg-ink border border-panelLine rounded-sm px-3 py-2 text-sm text-text placeholder:text-text-muted mb-3 focus:outline-none focus:border-signal"
        />
        {error && <p className="text-xs text-critical mb-3">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-xs uppercase tracking-wider bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/80 transition-colors disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>

        {oauthProviders.length > 0 && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-panelLine" />
              <span className="text-[9px] font-mono text-text-muted uppercase">or</span>
              <div className="flex-1 h-px bg-panelLine" />
            </div>
            <div className="grid gap-2">
              {oauthProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => signIn(provider.id, { callbackUrl })}
                  className="w-full font-mono text-xs uppercase tracking-wider border border-panelLine text-text px-4 py-2 rounded-sm hover:border-signal/60 hover:text-signal transition-colors"
                >
                  Continue with {provider.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-text-muted mt-4 text-center">
          No account?{" "}
          <Link href="/register" className="text-signal hover:underline">
            Register
          </Link>
        </p>
      </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
