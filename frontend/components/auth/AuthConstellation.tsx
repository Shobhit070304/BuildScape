"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Server,
  Database,
  Cpu,
  Layers,
  Terminal,
  Zap,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  role: string;
  icon: typeof Server;
  color: string;
  x: number; // percentage in canvas
  y: number; // percentage in canvas
  metric: string;
}

const NODES: NodeItem[] = [
  {
    id: "docker",
    name: "Docker Engine",
    role: "Container Runtime",
    icon: Server,
    color: "text-sky-400",
    x: 50,
    y: 12,
    metric: "cgroups & namespaces",
  },
  {
    id: "redis",
    name: "Redis Cluster",
    role: "In-Memory RESP",
    icon: Zap,
    color: "text-rose-400",
    x: 82,
    y: 22,
    metric: "0.4ms P99 latency",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    role: "Relational Storage",
    icon: Database,
    color: "text-indigo-400",
    x: 88,
    y: 54,
    metric: "WAL & ACID logs",
  },
  {
    id: "go",
    name: "Golang Chi",
    role: "High-Throughput API",
    icon: Cpu,
    color: "text-cyan-400",
    x: 78,
    y: 86,
    metric: "1.2M concurrent req/s",
  },
  {
    id: "kafka",
    name: "Event Broker",
    role: "Distributed Queue",
    icon: Layers,
    color: "text-amber-400",
    x: 50,
    y: 92,
    metric: "Partitioned log stream",
  },
  {
    id: "fastapi",
    name: "FastAPI AI",
    role: "Inference & Embeddings",
    icon: Terminal,
    color: "text-emerald-400",
    x: 18,
    y: 84,
    metric: "Streaming token vectors",
  },
  {
    id: "nextjs",
    name: "Next.js Core",
    role: "Fullstack Architecture",
    icon: Activity,
    color: "text-violet-400",
    x: 12,
    y: 54,
    metric: "React 19 Server Actions",
  },
  {
    id: "telemetry",
    name: "Prometheus",
    role: "Distributed Tracing",
    icon: ShieldCheck,
    color: "text-teal-400",
    x: 18,
    y: 22,
    metric: "Zero-drift checkpoints",
  },
];

export function AuthConstellation() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden select-none">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)] blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-[90px]"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="relative z-10 text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
          Select, Build &amp; Integrate.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed mx-auto lg:mx-0">
          Deconstruct real distributed architectures into hands-on implementation phases.
        </p>
      </div>

      {/* Main Constellation Canvas */}
      <div className="relative z-10 my-auto py-4 flex items-center justify-center min-h-[340px] sm:min-h-[380px]">
        <div className="relative h-[320px] w-full max-w-[460px] sm:h-[370px]">
          {/* SVG Vector Circuit Lines */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id="hubGlowMinimal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.22)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Radial backdrop around center hub */}
            <circle cx="50" cy="50" r="30" fill="url(#hubGlowMinimal)" />

            {/* Connecting circuit lines */}
            {NODES.map((node) => {
              const isHovered = hoveredNode === node.id;
              return (
                <g key={node.id}>
                  <line
                    x1="50"
                    y1="50"
                    x2={node.x}
                    y2={node.y}
                    stroke={isHovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.1)"}
                    strokeWidth={isHovered ? "0.9" : "0.5"}
                    strokeDasharray={isHovered ? "none" : "2,2"}
                    className="transition-all duration-300"
                  />
                  {/* Animated pulse dot along the vector */}
                  <circle
                    r={isHovered ? "1.4" : "0.8"}
                    fill={isHovered ? "#ffffff" : "#818cf8"}
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="cx"
                      from="50"
                      to={node.x}
                      dur={`${2.2 + (node.x % 3) * 0.4}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from="50"
                      to={node.y}
                      dur={`${2.2 + (node.x % 3) * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Central BuildScape Engine Hub */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
            style={{ width: "100px", height: "100px" }}
          >
            <div className="relative group cursor-pointer flex flex-col items-center justify-center h-full w-full rounded-2xl border border-white/20 bg-[#0B0B12]/95 p-2 shadow-xl shadow-indigo-500/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-indigo-400/50">
              <div className="absolute -inset-1 rounded-2xl bg-indigo-500/15 blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-white/[0.08] border border-white/10 mb-1">
                <Image
                  src="/icon.svg"
                  alt="BuildScape Core"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
              </div>
              <span className="text-[10px] font-extrabold tracking-tight text-white">
                BuildScape
              </span>
              <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
                CORE
              </span>
            </div>
          </div>

          {/* Orbiting Satellite Nodes */}
          {NODES.map((node) => {
            const isHovered = hoveredNode === node.id;
            const IconComp = node.icon;
            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-300"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 shadow-lg backdrop-blur-md transition-all duration-300 ${
                    isHovered
                      ? "border-white/40 bg-[#161624] scale-110 shadow-indigo-500/30"
                      : "border-white/[0.08] bg-[#0A0A10]/90 hover:border-white/25 hover:bg-[#12121D]"
                  }`}
                >
                  <div
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ${node.color}`}
                  >
                    <IconComp className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                      {node.name}
                    </span>
                    {isHovered && (
                      <span className="text-[8px] font-mono text-indigo-300 whitespace-nowrap">
                        {node.metric}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Bottom Tech Stack Line */}
      <div className="relative z-10 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[10px] font-mono text-neutral-400">
        {["Go", "Docker", "Redis", "Postgres", "Kafka", "Python"].map((tech) => (
          <span
            key={tech}
            className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-neutral-400"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
