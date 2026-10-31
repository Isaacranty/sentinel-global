"use client";

import { useState, useEffect } from "react";

type Node = {
  id: string;
  name: string;
  type: "core" | "edge" | "endpoint";
  status: "online" | "alert" | "offline";
  x: number;
  y: number;
};

const INITIAL_NODES: Node[] = [
  { id: "core-01", name: "SENTINEL_CORE", type: "core", status: "online", x: 200, y: 100 },
  { id: "edge-lon", name: "EDGE_LONDON", type: "edge", status: "online", x: 100, y: 200 },
  { id: "edge-nyc", name: "EDGE_NYC", type: "edge", status: "online", x: 300, y: 200 },
  { id: "node-01", name: "NODE_SQUAD_ALPHA", type: "endpoint", status: "online", x: 50, y: 300 },
  { id: "node-02", name: "NODE_SQUAD_BETA", type: "endpoint", status: "alert", x: 150, y: 300 },
  { id: "node-03", name: "NODE_TRAINING", type: "endpoint", status: "online", x: 250, y: 300 },
  { id: "node-04", name: "NODE_INTEL", type: "endpoint", status: "online", x: 350, y: 300 },
];

const LINKS = [
  { from: "core-01", to: "edge-lon" },
  { from: "core-01", to: "edge-nyc" },
  { from: "edge-lon", to: "node-01" },
  { from: "edge-lon", to: "node-02" },
  { from: "edge-nyc", to: "node-03" },
  { from: "edge-nyc", to: "node-04" },
];

export default function NetworkTopology() {
  const [nodes, setNodes] = useState(INITIAL_NODES);

  // Simple animation: randomize status for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.type === "endpoint" && Math.random() > 0.95) {
          return { ...n, status: Math.random() > 0.5 ? "online" : "alert" };
        }
        return n;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-panel border border-panelLine rounded-sm p-6 overflow-hidden relative">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
        Operational Node Topology
      </h3>

      <div className="aspect-[4/3] relative">
        <svg viewBox="0 0 400 350" className="w-full h-full">
            {/* Links */}
            {LINKS.map((link, i) => {
                const from = nodes.find(n => n.id === link.from)!;
                const to = nodes.find(n => n.id === link.to)!;
                return (
                    <line
                        key={i}
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke="rgba(67, 217, 163, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map(node => (
                <g key={node.id} className="cursor-help group">
                    <circle
                        cx={node.x} cy={node.y} r={node.type === 'core' ? 8 : 5}
                        className={`transition-colors duration-500 ${
                            node.status === 'online' ? 'fill-signal shadow-[0_0_10px_#43D9A3]' :
                            node.status === 'alert' ? 'fill-alert' : 'fill-text-muted'
                        }`}
                    />
                    <text
                        x={node.x} y={node.y + (node.type === 'core' ? 20 : 15)}
                        textAnchor="middle"
                        className="font-mono text-[7px] fill-text-muted uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                        {node.name}
                    </text>

                    {/* Tooltip on hover */}
                    <rect
                        x={node.x - 30} y={node.y - 35} width="60" height="20" rx="2"
                        className="fill-ink stroke-panelLine opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    />
                    <text
                        x={node.x} y={node.y - 22}
                        textAnchor="middle"
                        className="font-mono text-[6px] fill-signal uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                        STATUS: {node.status}
                    </text>
                </g>
            ))}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 justify-center font-mono text-[8px] text-text-muted uppercase">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-signal" /> Online</div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-alert" /> Anomaly</div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-text-muted" /> Offline</div>
      </div>
    </div>
  );
}
