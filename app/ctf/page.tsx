import { listChallenges } from "@/lib/challenges";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export default async function CtfListPage() {
  const session = await getServerSession(authOptions);
  const challenges = listChallenges();

  let solvedIds = new Set<string>();
  if (session?.user?.id) {
    const solved = await prisma.challengeInstance.findMany({
      where: { userId: session.user.id, status: "solved" },
      select: { challengeId: true },
    });
    solvedIds = new Set(solved.map((s) => s.challengeId));
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-mono text-xl tracking-tight mb-2 uppercase">Tactical Operations</h1>
        <p className="text-text-muted text-sm mb-8 font-mono uppercase tracking-widest text-[10px]">
          [ Each environment is isolated and time-boxed ]
        </p>

        <div className="grid gap-3">
            {challenges.length === 0 ? (
            <p className="text-text-muted text-sm italic">
                No active operations. Stand by for signals.
            </p>
            ) : (
            challenges.map((c) => (
                <Link
                key={c.id}
                href={`/ctf/${c.id}`}
                className="block border border-panelLine bg-panel rounded-sm p-4 hover:border-signal/60 transition-colors"
                >
                <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                    {solvedIds.has(c.id) ? (
                    <span className="text-signal font-bold tracking-widest">[DECRYPTED]</span>
                    ) : (
                    <span className="text-signal uppercase tracking-wider">{c.category}</span>
                    )}
                    <span className="text-text-muted">· {c.difficulty}</span>
                    <span className="text-text-muted ml-auto">{c.lifetime_minutes}m</span>
                </div>
                <h3 className="text-text text-sm font-semibold">{c.title}</h3>
                <p className="text-text-muted text-xs mt-1">{c.description}</p>
                </Link>
            ))
            )}
        </div>
      </div>
    </main>
  );
}
