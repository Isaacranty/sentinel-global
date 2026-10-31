import { NewsItem } from "@/lib/feeds";

export default function SignalTicker({ items }: { items: NewsItem[] }) {
  const headlines = items.slice(0, 10);
  return (
    <div className="border-y border-panelLine bg-panel/60 overflow-hidden">
      <div className="flex items-center gap-8 whitespace-nowrap py-2 px-4 font-mono text-xs text-text-muted animate-marquee">
        {headlines.concat(headlines).map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-signal">●</span>
            {item.title}
          </span>
        ))}
      </div>
    </div>
  );
}
