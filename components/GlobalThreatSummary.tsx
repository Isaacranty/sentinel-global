"use client";

import { NewsItem } from "@/lib/feeds";
import { useRouter, useSearchParams } from "next/navigation";

export default function GlobalThreatSummary({ items }: { items: NewsItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const breachCount = items.filter(i => i.category === 'breach').length;
  const malwareCount = items.filter(i => i.category === 'malware').length;
  const vulnCount = items.filter(i => i.category === 'vuln').length;

  function toggleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategory === category) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <button
        onClick={() => toggleFilter("breach")}
        className={`bg-panel border rounded-sm p-3 text-center transition-all ${currentCategory === 'breach' ? 'border-critical shadow-[0_0_10px_rgba(229,72,77,0.2)]' : 'border-panelLine hover:border-critical/60'}`}
      >
        <span className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Breaches</span>
        <span className={`text-xl font-mono ${breachCount > 0 ? 'text-critical' : 'text-text'}`}>
          {breachCount.toString().padStart(2, '0')}
        </span>
      </button>

      <button
        onClick={() => toggleFilter("malware")}
        className={`bg-panel border rounded-sm p-3 text-center transition-all ${currentCategory === 'malware' ? 'border-alert shadow-[0_0_10px_rgba(242,166,90,0.2)]' : 'border-panelLine hover:border-alert/60'}`}
      >
        <span className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Malware</span>
        <span className={`text-xl font-mono ${malwareCount > 0 ? 'text-alert' : 'text-text'}`}>
          {malwareCount.toString().padStart(2, '0')}
        </span>
      </button>

      <button
        onClick={() => toggleFilter("vuln")}
        className={`bg-panel border rounded-sm p-3 text-center transition-all ${currentCategory === 'vuln' ? 'border-signal shadow-[0_0_10px_rgba(67,217,163,0.2)]' : 'border-panelLine hover:border-signal/60'}`}
      >
        <span className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Vulns</span>
        <span className={`text-xl font-mono ${vulnCount > 0 ? 'text-signal' : 'text-text'}`}>
          {vulnCount.toString().padStart(2, '0')}
        </span>
      </button>
    </div>
  );
}
