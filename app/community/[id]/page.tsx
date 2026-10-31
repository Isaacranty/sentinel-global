import { getThread } from "@/lib/threadsStore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ContextTag from "@/components/ContextTag";
import ReplyForm from "@/components/ReplyForm";
import DeleteButton from "@/components/DeleteButton";
import VerifyButton from "@/components/VerifyButton";
import ReactionButtons from "@/components/ReactionButtons";
import ReportButton from "@/components/ReportButton";
import Link from "next/link";
import { notFound } from "next/navigation";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function ThreadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const thread = await getThread(params.id, session?.user?.id);

  if (!thread) return notFound();

  const isAdmin = session?.user?.role === "admin";

  return (
    <main className="min-h-screen">
      <header className="px-6 py-8 border-b border-panelLine">
        <div className="max-w-3xl mx-auto">
          <Link href="/community" className="font-mono text-xs text-text-muted hover:text-signal">
            ← Community
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ContextTag context={thread.context} />
            {thread.verified && (
              <span className="bg-signal text-ink text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm">
                Verified Signal
              </span>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <VerifyButton threadId={thread.id} isVerified={thread.verified} />
                <DeleteButton endpoint={`/api/threads/${thread.id}`} label="Delete Thread" />
              </div>
            )}
          </div>
          <span className="text-xs font-mono text-text-muted">
            {timeAgo(thread.createdAt)}
          </span>
        </div>
        <h1 className="text-text text-lg font-semibold mb-2">{thread.title}</h1>
        <p className="text-text-muted text-sm mb-1">{thread.body}</p>
        <p className="text-xs font-mono text-text-muted">
          — {thread.authorName}
        </p>

        <ReactionButtons
            threadId={thread.id}
            initialCounts={thread.reactionCounts as any}
            userReactions={thread.userReactions as any}
        />
        {session?.user?.id && (
          <div className="mt-2">
            <ReportButton endpoint={`/api/threads/${thread.id}/report`} />
          </div>
        )}

        <hr className="border-panelLine my-8" />

        <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
          {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
        </h2>
        <div className="grid gap-3 mb-6">
          {thread.replies.map((r) => (
            <div key={r.id} className="border border-panelLine bg-panel rounded-sm p-3">
              <div className="flex items-start justify-between mb-1">
                <p className="text-text text-sm">{r.body}</p>
                <div className="flex items-center gap-2">
                  {session?.user?.id && (
                    <ReportButton endpoint={`/api/threads/${thread.id}/replies/${r.id}/report`} />
                  )}
                  {isAdmin && (
                    <DeleteButton endpoint={`/api/threads/${thread.id}/replies/${r.id}`} label="Delete" />
                  )}
                </div>
              </div>
              <p className="text-xs font-mono text-text-muted">
                {r.authorName} · {timeAgo(r.createdAt)}
              </p>
            </div>
          ))}
        </div>

        <ReplyForm threadId={thread.id} />
      </div>
    </main>
  );
}
