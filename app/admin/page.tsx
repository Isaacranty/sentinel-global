import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import VerifyButton from "@/components/VerifyButton";
import ApproveButton from "@/components/ApproveButton";
import BanButton from "@/components/BanButton";
import ResolveReportButton from "@/components/ResolveReportButton";
import SiteHeader from "@/components/SiteHeader";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  const [stats, unverifiedThreads, pendingWriteups, , openReports, allUsers] = await Promise.all([
    Promise.all([
        prisma.user.count(),
        prisma.challengeInstance.count({ where: { status: "solved" } }),
        prisma.thread.count(),
        prisma.activity.count()
    ]),
    prisma.thread.findMany({
      where: { verified: false },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.writeUp.findMany({
      where: { verified: false },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.report.findMany({
      where: { status: "open" },
      include: {
        reporter: { select: { name: true } },
        thread: { select: { id: true, title: true } },
        reply: { select: { id: true, body: true, threadId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, banned: true, emailVerified: true },
    }),
  ]);

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-mono text-xl tracking-tight mb-8 uppercase text-alert flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-alert animate-ping" />
            Intelligence Control Center
        </h1>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
                { label: "Total Operators", val: stats[0] },
                { label: "Signals Decrypted", val: stats[1] },
                { label: "Comm Transmissions", val: stats[2] },
                { label: "Total Activities", val: stats[3] },
            ].map((s, i) => (
                <div key={i} className="bg-panel border border-panelLine p-4 rounded-sm">
                    <span className="block font-mono text-[10px] text-text-muted uppercase mb-1">{s.label}</span>
                    <span className="text-xl font-mono text-text">{s.val}</span>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
            {/* Reports */}
            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-critical" />
                    Open Reports
                </h2>
                <div className="space-y-3">
                    {openReports.length === 0 ? (
                        <p className="text-xs text-text-muted italic bg-panel/30 p-4 rounded-sm border border-panelLine border-dashed">No open reports.</p>
                    ) : (
                        openReports.map(r => (
                            <div key={r.id} className="bg-panel border border-panelLine p-4 rounded-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Link
                                            href={`/community/${r.thread?.id ?? r.reply?.threadId}`}
                                            className="text-sm font-semibold hover:text-signal transition-colors"
                                        >
                                            {r.thread ? r.thread.title : `Reply: "${r.reply?.body.slice(0, 60)}…"`}
                                        </Link>
                                        <p className="text-[10px] font-mono text-text-muted mt-1 uppercase">
                                            REPORTED BY {r.reporter.name}
                                        </p>
                                    </div>
                                    <ResolveReportButton reportId={r.id} />
                                </div>
                                <p className="text-xs text-text-muted font-mono bg-ink p-2 rounded-sm">{r.reason}</p>
                                {r.evidenceUrl && (
                                    <a
                                        href={r.evidenceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-[9px] font-mono uppercase text-signal underline"
                                    >
                                        View Evidence
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Thread Moderation */}
            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-alert" />
                    Unverified Discussions
                </h2>
                <div className="space-y-3">
                    {unverifiedThreads.length === 0 ? (
                        <p className="text-xs text-text-muted italic bg-panel/30 p-4 rounded-sm border border-panelLine border-dashed">No pending verifications.</p>
                    ) : (
                        unverifiedThreads.map(t => (
                            <div key={t.id} className="bg-panel border border-panelLine p-4 rounded-sm flex justify-between items-center">
                                <div>
                                    <Link href={`/community/${t.id}`} className="text-sm font-semibold hover:text-signal transition-colors">{t.title}</Link>
                                    <p className="text-[10px] font-mono text-text-muted mt-1 uppercase">BY {t.author.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <VerifyButton threadId={t.id} isVerified={false} />
                                    <DeleteButton endpoint={`/api/threads/${t.id}`} label="Scrub" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Write-up Moderation */}
            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-critical" />
                    Pending Mission Reports
                </h2>
                <div className="space-y-3">
                    {pendingWriteups.length === 0 ? (
                        <p className="text-xs text-text-muted italic bg-panel/30 p-4 rounded-sm border border-panelLine border-dashed">All reports processed.</p>
                    ) : (
                        pendingWriteups.map(w => (
                            <div key={w.id} className="bg-panel border border-panelLine p-4 rounded-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-sm font-bold">{w.title}</h3>
                                    <div className="flex gap-2">
                                        <ApproveButton writeUpId={w.id} />
                                        <DeleteButton endpoint={`/api/ctf/writeups/${w.id}`} label="Reject" />
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted line-clamp-3 mb-2 font-mono bg-ink p-2 rounded-sm">{w.content}</p>
                                {w.attachmentUrl && (
                                    <a
                                        href={w.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mb-2 text-[9px] font-mono uppercase text-signal underline"
                                    >
                                        View Attachment
                                    </a>
                                )}
                                <span className="text-[9px] font-mono text-text-muted uppercase">OPERATOR: {w.author.name} · CHALLENGE: {w.challengeId}</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* All Operators / Ban management */}
            <section>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">All Operators</h2>
                <div className="bg-panel border border-panelLine rounded-sm overflow-hidden">
                    <table className="w-full text-left">
                        <tbody className="text-[10px] font-mono">
                            {allUsers.map(u => (
                                <tr key={u.id} className="border-b border-panelLine/50 last:border-0">
                                    <td className="px-4 py-3 text-text">{u.name}</td>
                                    <td className="px-4 py-3 text-text-muted">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`uppercase ${u.role === 'admin' ? 'text-signal' : 'text-text-muted'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`uppercase ${u.emailVerified ? 'text-signal' : 'text-text-muted'}`}>
                                            {u.emailVerified ? "verified" : "unverified"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.banned ? (
                                            <span className="uppercase text-critical">banned</span>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {u.role !== 'admin' && (
                                            <BanButton userId={u.id} isBanned={u.banned} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
      </div>
    </main>
  );
}
