import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import SquadManager from "@/components/SquadManager";

export default async function SquadsPage() {
  const session = await getServerSession(authOptions);

  const userTeam = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: {
                include: {
                    members: { select: { id: true, name: true, role: true } },
                    activities: { take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }
                }
            }
        }
      })
    : null;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-mono text-xl tracking-tight mb-2 uppercase">Squad Operations</h1>
        <p className="text-text-muted text-sm mb-10 font-mono uppercase tracking-widest text-[10px]">
          [ Form squads and synchronize intelligence across your team ]
        </p>

        {userTeam?.team ? (
            <div className="grid md:grid-cols-[1fr_300px] gap-10">
                <section>
                    <div className="bg-panel border border-panelLine p-6 rounded-sm mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="font-mono text-[10px] text-signal uppercase tracking-widest block mb-1">Squad Active</span>
                                <h2 className="text-2xl font-bold">{userTeam.team.name}</h2>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-[10px] text-text-muted uppercase block">Invite Code</span>
                                <span className="font-mono text-lg text-text select-all">{userTeam.team.inviteCode}</span>
                            </div>
                        </div>
                        <p className="text-sm text-text-muted mb-6">{userTeam.team.description || "No squad objective defined."}</p>
                    </div>

                    <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">Squad Intelligence Feed</h3>
                    <div className="space-y-3">
                        {userTeam.team.activities.length === 0 ? (
                            <p className="text-xs text-text-muted italic border border-dashed border-panelLine p-8 text-center rounded-sm">No recent squad activities.</p>
                        ) : (
                            userTeam.team.activities.map(a => {
                                let details = { challengeTitle: "", courseTitle: "" };
                                try { details = JSON.parse(a.data); } catch (e) {}
                                return (
                                    <div key={a.id} className="bg-ink/40 border border-panelLine p-3 rounded-sm text-[11px] font-mono">
                                        <span className="text-signal mr-2">{a.user.name}</span>
                                        <span className="text-text-muted">{a.type.replace(/_/g, ' ')}:</span>
                                        <span className="text-text ml-2">{details.challengeTitle || details.courseTitle || "Operation completed."}</span>
                                        <span className="block text-[9px] text-text-muted mt-1">{new Date(a.createdAt).toLocaleTimeString()} UTC</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <aside>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">Unit Roster</h3>
                    <div className="bg-panel border border-panelLine rounded-sm overflow-hidden mb-8">
                        {userTeam.team.members.map(m => (
                            <div key={m.id} className="flex justify-between items-center px-4 py-3 border-b border-panelLine last:border-0">
                                <span className="text-xs font-semibold">{m.name}</span>
                                <span className={`text-[9px] font-mono uppercase ${m.id === session?.user?.id ? 'text-signal' : 'text-text-muted'}`}>
                                    {m.id === userTeam.id && userTeam.isTeamLeader ? 'LEADER' : 'OPERATOR'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-panel/40 border border-panelLine p-4 rounded-sm">
                        <h4 className="font-mono text-[10px] text-text-muted uppercase mb-3">Tactical Comms</h4>
                        <p className="text-[10px] leading-relaxed text-text-muted italic">Share your invite code with other operators to bring them into the squad. Only the squad leader can disband the unit.</p>
                    </div>
                </aside>
            </div>
        ) : (
            <SquadManager />
        )}
      </div>
    </main>
  );
}
