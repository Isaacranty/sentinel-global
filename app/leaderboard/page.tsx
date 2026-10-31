import { getLeaderboard } from "@/lib/userStore";
import SiteHeader from "@/components/SiteHeader";
import ActivityHeartbeat from "@/components/ActivityHeartbeat";
import Link from "next/link";

function getTier(count: number) {
  if (count >= 6) return { name: "Global Elite", color: "text-signal" };
  if (count >= 3) return { name: "Senior Operator", color: "text-text" };
  return { name: "Junior Operator", color: "text-text-muted" };
}

export default async function LeaderboardPage() {
  const rankings = await getLeaderboard();

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_320px] gap-10">
        <div>
            <h1 className="font-mono text-xl tracking-tight mb-2 uppercase">Global Rankings</h1>
            <p className="text-text-muted text-sm mb-8 font-mono uppercase tracking-widest text-[10px]">
                [ Ranking by Decrypted Signals ]
            </p>

            <div className="border border-panelLine bg-panel rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-panelLine font-mono text-[10px] uppercase tracking-widest text-text-muted">
                <th className="px-6 py-3 font-normal">Rank</th>
                <th className="px-6 py-3 font-normal">Operator</th>
                <th className="px-6 py-3 font-normal">Tier</th>
                <th className="px-6 py-3 font-normal text-right">Signals</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rankings.map((user, i) => {
                const tier = getTier(user.solvedCount);
                return (
                  <tr key={user.id} className="border-b border-panelLine/50 last:border-0">
                    <td className="px-6 py-4 font-mono text-xs text-text-muted">
                      {(i + 1).toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text">
                      {user.name}
                    </td>
                    <td className={`px-6 py-4 font-mono text-[10px] uppercase tracking-wider ${tier.color}`}>
                      {tier.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-signal text-right">
                      {user.solvedCount}
                    </td>
                  </tr>
                );
              })}
              {rankings.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-text-muted italic">
                          No signals decrypted yet.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside>
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
              Real-time Promotions
          </h2>
          <ActivityHeartbeat />
      </aside>
    </div>
  </main>
  );
}
