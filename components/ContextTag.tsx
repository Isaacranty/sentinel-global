import { ThreadContext } from "@/lib/threadsStore";

export default function ContextTag({ context }: { context: ThreadContext }) {
  if (context.type === "news") {
    return (
      <a
        href={context.refUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono text-alert hover:text-signal transition-colors truncate max-w-[220px]"
        title={context.refTitle}
      >
        📰 {context.refTitle}
      </a>
    );
  }
  if (context.type === "path") {
    return (
      <span className="text-xs font-mono text-signal truncate max-w-[220px]" title={context.refTitle}>
        📚 {context.refTitle}
      </span>
    );
  }
  return <span className="text-xs font-mono text-text-muted">general</span>;
}
