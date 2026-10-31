import { getRecentActivities } from "@/lib/activityStore";
import Link from "next/link";

export default async function GlobalFeedPage() {
  const activities = await getRecentActivities(50);

  function formatActivity(activity: any) {
    const { name } = activity.user;
    switch (activity.type) {
      case "CHALLENGE_SOLVED":
        return (
          <>
            Operator <span className="text-signal">{name}</span> successfully decrypted{" "}
            <span className="text-text font-bold">{activity.data.challengeTitle}</span>
          </>
        );
      case "COURSE_COMPLETED":
        return (
          <>
            Operator <span className="text-signal">{name}</span> completed advanced training:{" "}
            <span className="text-text font-bold">{activity.data.courseTitle}</span>
          </>
        );
      case "VERIFIED_SIGNAL":
        return (
          <>
            Intelligence signal from <span className="text-signal">{name}</span> was{" "}
            <span className="text-signal font-bold underline">VERIFIED</span> by Central Command.
          </>
        );
      case "LEVEL_UP":
          return (
            <>
              Operator <span className="text-signal">{name}</span> achieved{" "}
              <span className="text-signal font-bold uppercase">Security Level {activity.data.level}</span>
            </>
          );
      case "THREAD_CREATED":
          return (
              <>
                Operator <span className="text-signal">{name}</span> initiated a new tactical discussion:{" "}
                <span className="text-text">{activity.data.threadTitle}</span>
              </>
          );
      case "XP_EARNED":
          return (
              <>
                Operator <span className="text-signal">{name}</span> earned XP:{" "}
                <span className="text-text font-bold">{activity.data.reason}</span>
              </>
          );
      case "SQUAD_JOINED":
          return (
              <>
                Operator <span className="text-signal">{name}</span> {activity.data.isLeader ? 'commissioned' : 'joined'} squad:{" "}
                <span className="text-text font-bold">{activity.data.teamName}</span>
              </>
          );
      default:
        return `New transmission from ${name}`;
    }
  }

  return (
    <main className="min-h-screen">
      <header className="px-6 py-8 border-b border-panelLine">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="font-mono text-xs text-text-muted hover:text-signal">
            ← Sentinel Global
          </Link>
          <h1 className="font-mono text-xl tracking-tight mt-2">Global Activity Log</h1>
          <p className="text-text-muted text-sm mt-1">Real-time tactical feed of all operator actions.</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-sm text-text-muted italic text-center py-20">Waiting for tactical signals...</p>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="flex gap-4 items-start">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal/40 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-xs font-mono text-text-muted leading-relaxed">
                        {formatActivity(a)}
                    </p>
                    <span className="text-[10px] font-mono text-text-muted uppercase mt-1 block">
                        {new Date(a.createdAt).toLocaleString()} UTC
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
