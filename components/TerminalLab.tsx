"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  initialPath?: string;
  expectedCommands?: { cmd: string; response: string }[];
};

export default function TerminalLab({ initialPath = "/home/operator", expectedCommands = [] }: Props) {
  const [history, setHistory] = useState<string[]>(["Sentinel Global Tactical Terminal v1.0.4", "Connection established. Root access restricted.", ""]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newHistory = [...history, `${initialPath} $ ${cmd}`];

    // Process command
    if (cmd === "ls") {
        newHistory.push("flag.txt  notes.txt  tools/");
    } else if (cmd === "whoami") {
        newHistory.push("operator");
    } else if (cmd === "clear") {
        setHistory([]);
        setInput("");
        return;
    } else if (cmd === "help") {
        newHistory.push("Available commands: ls, whoami, help, clear, cat [file], nmap [target]");
    } else if (cmd.startsWith("cat ")) {
        const file = cmd.split(" ")[1];
        if (file === "flag.txt") newHistory.push("PERMISSION DENIED: Encrypted file.");
        else if (file === "notes.txt") newHistory.push("Note to self: Don't forget to rotate the JWT keys.");
        else newHistory.push(`cat: ${file}: No such file or directory`);
    } else {
        const expected = expectedCommands.find(c => c.cmd === cmd);
        if (expected) {
            newHistory.push(expected.response);
        } else {
            newHistory.push(`command not found: ${cmd.split(" ")[0]}`);
        }
    }

    setHistory(newHistory);
    setInput("");
  }

  return (
    <div className="bg-ink border border-panelLine rounded-sm overflow-hidden mt-12 shadow-2xl">
      <div className="bg-panel px-4 py-2 border-b border-panelLine flex items-center justify-between">
          <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-critical/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-alert/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-signal/40" />
          </div>
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Tactical Environment</span>
      </div>
      <div
        ref={scrollRef}
        className="p-6 h-64 overflow-y-auto font-mono text-xs text-signal/90 leading-relaxed scrollbar-thin scrollbar-thumb-panelLine"
      >
        {history.map((line, i) => (
          <div key={i} className="min-h-[1.2em] whitespace-pre-wrap">{line}</div>
        ))}
        <form onSubmit={handleCommand} className="flex mt-1">
          <span className="text-text-muted mr-2">{initialPath} $</span>
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-signal"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
