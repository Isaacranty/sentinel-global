import Link from "next/link";
import AuthStatus from "./AuthStatus";
import NotificationCenter from "./NotificationCenter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      <div className="bg-signal/5 border-b border-panelLine py-1 px-6 hidden md:block overflow-hidden whitespace-nowrap">
        <div className="flex gap-8 animate-marquee font-mono text-[8px] text-signal/60 uppercase">
          <span>● UPLINK: STABLE</span>
          <span>● LATENCY: 24MS</span>
          <span>● NODES: 42/42</span>
          <span>● SECURITY OVERRIDE: INACTIVE</span>
          <span>● THREAT LEVEL: MINIMAL</span>
          <span>● UPLINK: STABLE</span>
          <span>● LATENCY: 24MS</span>
          <span>● NODES: 42/42</span>
          <span>● SECURITY OVERRIDE: INACTIVE</span>
          <span>● THREAT LEVEL: MINIMAL</span>
        </div>
      </div>
      <header className="px-6 py-6 border-b border-panelLine bg-ink/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="group">
            <span className="font-mono text-lg tracking-tight font-bold">
              SENTINEL<span className="text-signal group-hover:animate-pulse">_GLOBAL</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/brief" className="font-mono text-[10px] uppercase tracking-widest text-signal hover:text-signal/80 transition-colors animate-pulse">Briefing</Link>
            <Link href="/courses" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">Academy</Link>
            <Link href="/ctf" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">CTF</Link>
            <Link href="/community" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">Community</Link>
            <Link href="/squads" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">Squads</Link>
            <Link href="/downloads" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">Assets</Link>
            <Link href="/leaderboard" className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-signal transition-colors">Rankings</Link>
            {isAdmin && (
              <Link href="/admin" className="font-mono text-[10px] uppercase tracking-widest text-alert hover:text-alert/80 transition-colors bg-alert/10 px-2 py-1 rounded-sm border border-alert/20">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-4 border-r border-panelLine pr-4">
              <span className="font-mono text-[8px] text-text-muted uppercase">Operator_ID</span>
              <span className="font-mono text-[10px] text-signal tracking-widest">{session?.user?.name?.split(' ')[0] || 'GHOST'}_CORE</span>
            </div>
            <NotificationCenter />
            <AuthStatus />
          </div>
        </div>
      </header>
    </>
  );
}
