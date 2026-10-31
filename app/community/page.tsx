import { readThreads } from "@/lib/threadsStore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ThreadCard from "@/components/ThreadCard";
import NewThreadForm from "@/components/NewThreadForm";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { Suspense } from "react";

export default async function CommunityPage({ searchParams }: { searchParams: { sort?: string } }) {
  const sortBy = searchParams.sort === "trending" ? "trending" : "recent";
  const session = await getServerSession(authOptions);
  const threads = await readThreads(session?.user?.id, sortBy);

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
            <h1 className="font-mono text-xl tracking-tight">Global Signals</h1>
            <div className="flex gap-2">
                <Link
                href="/community?sort=recent"
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border ${sortBy === 'recent' ? 'bg-signal/20 border-signal text-signal' : 'border-panelLine text-text-muted'}`}
                >
                Recent
                </Link>
                <Link
                href="/community?sort=trending"
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border ${sortBy === 'trending' ? 'bg-signal/20 border-signal text-signal' : 'border-panelLine text-text-muted'}`}
                >
                Trending
                </Link>
            </div>
        </div>

        <Suspense>
          <NewThreadForm />
        </Suspense>

        <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
          Intel Log
        </h2>
        {threads.length === 0 ? (
          <p className="text-text-muted text-sm">
            No threads yet — start the first one above.
          </p>
        ) : (
          <div className="grid gap-3">
            {threads.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
