import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { format } from "date-fns";
import PrintBriefButton from "@/components/PrintBriefButton";

export default async function DailyBriefPage() {
  const latestBrief = await prisma.dailyBrief.findFirst({
    orderBy: { date: "desc" }
  });

  if (!latestBrief) {
    return (
      <main className="min-h-screen text-center flex flex-col items-center justify-center p-6">
        <SiteHeader />
        <div className="max-w-md">
            <h1 className="font-mono text-xl text-alert mb-4">NO BRIEFING AVAILABLE</h1>
            <p className="text-text-muted text-sm font-mono mb-8">Central Command has not yet released today's intelligence summary. Check back at 06:00 UTC.</p>
            <Link href="/" className="bg-panel border border-panelLine px-6 py-2 text-xs font-mono uppercase text-signal hover:bg-signal/10 transition-colors">Return to Dashboard</Link>
        </div>
      </main>
    );
  }

  const data = JSON.parse(latestBrief.content);

  return (
    <main className="min-h-screen relative overflow-hidden bg-ink">
      {/* Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      <SiteHeader />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-start border-l-4 border-signal pl-6 mb-12">
            <div>
                <span className="font-mono text-[10px] text-signal uppercase tracking-[0.3em] block mb-2 animate-pulse">● System: Active Intelligence</span>
                <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Tactical Intelligence Brief</h1>
                <p className="font-mono text-text-muted text-sm uppercase">Operational Date: {format(new Date(latestBrief.date), "yyyy-MM-dd")}</p>
            </div>
            <div className="hidden md:block font-mono text-[9px] text-text-muted text-right space-y-1">
                <p>REF_ID: {latestBrief.id.slice(0, 8).toUpperCase()}</p>
                <p>ENC_TYPE: AES-256-GCM</p>
                <p>SEC_LVL: LEVEL-4</p>
            </div>
        </div>

        <div className="grid gap-12">
            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-6 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_#43D9A3]" />
                    Top Sector Signals
                </h2>
                <div className="grid gap-4">
                    {data.topNews.map((item: any, i: number) => (
                        <div key={i} className="group bg-panel border border-panelLine p-6 rounded-sm hover:border-signal/40 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 border-t border-r border-signal" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 border-b border-l border-signal" />
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-[10px] text-signal uppercase">Source: {item.sourceName}</span>
                                <span className="font-mono text-[9px] text-text-muted uppercase border border-panelLine px-1.5 rounded-sm">{item.category}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-3 group-hover:text-signal transition-colors">{item.title}</h3>
                            <p className="text-sm text-text-muted leading-relaxed mb-4">{item.contentSnippet}</p>
                            <a href={item.link} target="_blank" className="text-[10px] font-mono text-signal hover:underline uppercase tracking-widest flex items-center gap-2">
                                [ Execute Read ] <span className="text-[8px] animate-pulse">_</span>
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-6 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-alert shadow-[0_0_8px_#F2A65A]" />
                    Operator Engagement Trends
                </h2>
                <div className="space-y-4">
                    {data.topThreads.map((thread: any, i: number) => (
                        <Link key={i} href={`/community/${thread.id}`} className="block bg-panel/40 border border-panelLine p-5 rounded-sm hover:bg-panel transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold">{thread.title}</span>
                                {thread.verified && <span className="text-[8px] bg-signal/10 text-signal border border-signal/20 px-1 rounded-sm uppercase">Verified</span>}
                            </div>
                            <p className="text-xs text-text-muted font-mono truncate mb-2">{thread.body}</p>
                            <div className="flex justify-between items-center text-[9px] font-mono text-text-muted uppercase">
                                <span>Author: {thread.authorName}</span>
                                <span>Replies: {thread.repliesCount}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>

        <div className="mt-20 pt-10 border-t border-panelLine flex justify-between items-center no-print">
            <p className="text-[10px] font-mono text-text-muted italic max-w-sm">This brief is dynamically generated based on global activity and vetted intelligence sources.</p>
            <div className="flex gap-4">
                <PrintBriefButton />
                <Link href="/profile" className="font-mono text-[10px] text-signal hover:underline uppercase">Manage Subscription</Link>
            </div>
        </div>
      </div>
    </main>
  );
}
