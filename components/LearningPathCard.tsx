import { LearningPath } from "@/lib/learningPaths";

type Props = {
  path: LearningPath;
  completed: Set<string>;
  onToggle?: (pathId: string, resourceUrl: string) => void;
  showCheckboxes: boolean;
};

export default function LearningPathCard({ path, completed, onToggle, showCheckboxes }: Props) {
  const discussHref = `/community?context=path&title=${encodeURIComponent(
    `Questions on: ${path.title}`
  )}&refTitle=${encodeURIComponent(path.title)}`;

  const doneCount = path.resources.filter((r) => completed.has(r.url)).length;

  return (
    <div className="border border-panelLine bg-panel rounded-sm p-4">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-signal text-xs">{path.tier}</span>
        <h3 className="text-text font-semibold text-sm">{path.title}</h3>
        {showCheckboxes && (
          <span className="ml-auto font-mono text-xs text-text-muted">
            {doneCount}/{path.resources.length}
          </span>
        )}
      </div>
      <p className="text-text-muted text-xs leading-relaxed mb-3">{path.blurb}</p>
      <ul className="space-y-1.5 mb-2">
        {path.resources.map((r) => {
          const isDone = completed.has(r.url);
          return (
            <li key={r.url} className="flex items-center gap-2">
              {showCheckboxes && (
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle?.(path.id, r.url)}
                  className="accent-signal h-3.5 w-3.5 cursor-pointer flex-shrink-0"
                  aria-label={`Mark "${r.label}" complete`}
                />
              )}
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-mono transition-colors underline decoration-panelLine underline-offset-2 ${
                  isDone ? "text-text-muted line-through" : "text-text-muted hover:text-signal"
                }`}
              >
                → {r.label}
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href={discussHref}
        className="inline-block text-xs font-mono text-text-muted hover:text-signal transition-colors"
      >
        💬 Discuss →
      </a>
    </div>
  );
}
