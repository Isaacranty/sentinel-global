import { NewsItem } from "@/lib/feeds";
import { Thread } from "@/lib/threadsStore";
import BookmarkButton from "./BookmarkButton";

const CATEGORY_COLOR: Record<NewsItem["category"], string> = {
  breach: "text-critical",
  vuln: "text-alert",
  malware: "text-alert",
  general: "text-signal",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsCard({ item, existingThread, isBookmarked }: { item: NewsItem, existingThread?: Thread, isBookmarked?: boolean }) {
  const diffMs = Date.now() - new Date(item.isoDate).getTime();
  const isNew = diffMs < 24 * 60 * 60 * 1000;

  const discussHref = existingThread
    ? `/community/${existingThread.id}`
    : `/community?context=news&title=${encodeURIComponent(`Re: ${item.title}`)}&refTitle=${encodeURIComponent(item.title)}&refUrl=${encodeURIComponent(item.link)}`;

  const signalCount = existingThread?.reactionCounts.SIGNAL || 0;
  const replyCount = existingThread?.replies.length || 0;

  return (
    <div className="group border border-panelLine bg-panel rounded-sm p-4 hover:border-signal/60 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          {isNew && (
            <span className="relative flex h-2 w-2">
              <span className="blip absolute inline-flex h-full w-full rounded-full bg-signal/70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-signal" />
            </span>
          )}
          <span className={`uppercase tracking-wider ${CATEGORY_COLOR[item.category]}`}>
            {item.category}
          </span>
          <span className="text-text-muted">· {item.sourceName}</span>
          <span className="text-text-muted">{timeAgo(item.isoDate)}</span>
        </div>
        <BookmarkButton
            newsUrl={item.link}
            threadId={existingThread?.id}
            title={item.title}
            isBookmarked={!!isBookmarked}
        />
      </div>
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
        <h3 className="text-text text-sm font-semibold leading-snug group-hover:text-signal transition-colors">
          {item.title}
        </h3>
        {item.contentSnippet && (
          <p className="text-text-muted text-xs mt-1.5 leading-relaxed line-clamp-2">
            {item.contentSnippet}
          </p>
        )}
      </a>
      <div className="flex items-center justify-between mt-2">
        <a
          href={discussHref}
          className="text-xs font-mono text-text-muted hover:text-signal transition-colors"
        >
          {existingThread ? `💬 ${replyCount} comments` : "💬 Discuss →"}
        </a>

        {existingThread && (
          <div className="flex items-center gap-3 text-[10px] font-mono">
            {signalCount > 0 && <span className="text-signal">📡 {signalCount}</span>}
            {existingThread.reactionCounts.UPVOTE > 0 && (
              <span className="text-text-muted">▲ {existingThread.reactionCounts.UPVOTE}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
