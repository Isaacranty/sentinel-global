import Link from "next/link";
import { Thread } from "@/lib/threadsStore";
import ContextTag from "@/components/ContextTag";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ThreadCard({ thread }: { thread: Thread }) {
  const upvotes = thread.reactionCounts.UPVOTE || 0;
  const signals = thread.reactionCounts.SIGNAL || 0;

  return (
    <Link
      href={`/community/${thread.id}`}
      className="block border border-panelLine bg-panel rounded-sm p-4 hover:border-signal/60 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ContextTag context={thread.context} />
          {thread.verified && (
            <span className="bg-signal text-ink text-[8px] font-mono uppercase px-1 rounded-sm">
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
            {signals > 0 && <span className="text-signal">📡 {signals}</span>}
            {upvotes > 0 && <span className="text-text-muted">▲ {upvotes}</span>}
            <span className="text-text-muted">
              {timeAgo(thread.createdAt)}
            </span>
        </div>
      </div>
      <h3 className="text-text text-sm font-semibold mb-1">{thread.title}</h3>
      <p className="text-text-muted text-xs line-clamp-2 mb-2">{thread.body}</p>
      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>{thread.authorName}</span>
        <span>{thread.replies.length} replies</span>
      </div>
    </Link>
  );
}
