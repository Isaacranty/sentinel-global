import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-mono text-4xl text-alert mb-4">404</h1>
          <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">Signal Lost</h2>
          <p className="text-text-muted text-sm font-mono mb-8">
            The transmission you are looking for does not exist or has been redacted.
          </p>
          <Link
            href="/"
            className="bg-panel border border-panelLine px-6 py-2 text-xs font-mono uppercase text-signal hover:bg-signal/10 transition-colors"
          >
            Return to Command
          </Link>
        </div>
      </div>
    </main>
  );
}
