"use client";

export default function PrintBriefButton() {
  return (
    <button
      onClick={() => window.print()}
      className="font-mono text-[10px] text-text-muted hover:text-signal uppercase"
    >
      [ Print Brief ]
    </button>
  );
}
