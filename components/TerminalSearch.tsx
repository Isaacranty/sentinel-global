"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TerminalSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="bg-ink border border-panelLine p-2 rounded-sm mb-8 flex items-center gap-3 group focus-within:border-signal/60 transition-colors">
      <span className="text-signal font-mono text-xs pl-2">$</span>
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="grep -i 'vulnerability' global_feed..."
          className="w-full bg-transparent border-none outline-none text-xs font-mono text-text placeholder:text-text-muted/50"
        />
      </form>
      <span className="text-[10px] font-mono text-text-muted pr-2 hidden sm:block uppercase tracking-tighter">[ Intel Search ]</span>
    </div>
  );
}
