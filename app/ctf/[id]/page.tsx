import { getChallenge } from "@/lib/challenges";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChallengeRunner from "@/components/ChallengeRunner";
import WriteUpForm from "@/components/WriteUpForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const challenge = getChallenge(params.id);
  if (!challenge) return notFound();

  const session = await getServerSession(authOptions);
  const activeInstance = session?.user?.id
    ? await prisma.challengeInstance.findFirst({
        where: { userId: session.user.id, challengeId: params.id },
        orderBy: { startedAt: "desc" }
      })
    : null;

  const isSolved = activeInstance?.status === "solved";

  const writeUps = await prisma.writeUp.findMany({
      where: { challengeId: params.id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen">
      <header className="px-6 py-8 border-b border-panelLine">
        <div className="max-w-3xl mx-auto">
          <Link href="/ctf" className="font-mono text-xs text-text-muted hover:text-signal">
            ← CTF Challenges
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs">
          {isSolved ? (
            <span className="text-signal font-bold">[SOLVED]</span>
          ) : (
            <span className="text-signal uppercase tracking-wider">{challenge.category}</span>
          )}
          <span className="text-text-muted">· {challenge.difficulty}</span>
          <span className="text-text-muted ml-auto">{challenge.lifetime_minutes} min sandbox</span>
        </div>
        <h1 className="text-text text-lg font-semibold mb-2">{challenge.title}</h1>
        <p className="text-text-muted text-sm mb-6">{challenge.description}</p>

        <ChallengeRunner challengeId={challenge.id} hints={challenge.hints} />

        {isSolved && <WriteUpForm challengeId={challenge.id} />}

        {writeUps.length > 0 && (
            <div className="mt-12">
                <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-6">Mission Reports (Write-ups)</h3>
                <div className="space-y-4">
                    {writeUps.map(wu => (
                        <div key={wu.id} className="border border-panelLine bg-panel rounded-sm p-6">
                            <h4 className="text-sm font-bold mb-2">{wu.title}</h4>
                            <p className="text-xs text-text-muted font-mono whitespace-pre-wrap mb-4 bg-ink p-3 rounded-sm">
                                {wu.content}
                            </p>
                            <span className="text-[10px] font-mono text-text-muted uppercase">— {wu.author.name} · {new Date(wu.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </main>
  );
}
