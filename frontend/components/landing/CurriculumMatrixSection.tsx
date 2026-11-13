"use client";

import { useState } from "react";
import { Database, Cpu, Zap, Cloud, Layers } from "lucide-react";
import { TechIcon } from "@/components/TechBadge";

interface MatrixRow {
  track: string;
  projectName: string;
  schemaLayer: string;
  concurrencyLayer: string;
  cachingLayer: string;
  cloudLayer: string;
}

const MATRIX_DATA: MatrixRow[] = [
  {
    track: "Golang",
    projectName: "Habitly Go Engine",
    schemaLayer: "PostgreSQL pgx pool with 3NF relational migrations",
    concurrencyLayer: "Goroutines with sync.RWMutex & race detection",
    cachingLayer: "Redis cache-aside with TTL invalidation",
    cloudLayer: "Multi-stage Alpine Docker (14.2 MB) on Fly.io",
  },
  {
    track: "TypeScript",
    projectName: "SpendWise Finance",
    schemaLayer: "Strict Zod schemas & client-side IndexedDB persistence",
    concurrencyLayer: "React 19 Server Components & optimistic state",
    cachingLayer: "TanStack query cache with background revalidation",
    cloudLayer: "Automated Vercel Edge with zero cold starts",
  },
  {
    track: "Python",
    projectName: "CardForge AI",
    schemaLayer: "SQLAlchemy 2.0 async sessions & Pydantic v2 models",
    concurrencyLayer: "Asyncio task gathering with OpenAI streaming",
    cachingLayer: "Redis sliding-window rate limiters (100 req/min)",
    cloudLayer: "Gunicorn Uvicorn workers on Render Cloud",
  },
  {
    track: "Spring Boot",
    projectName: "JobTrail Portal",
    schemaLayer: "Hibernate 6 JPA entities with PostgreSQL indexes",
    concurrencyLayer: "Java 21 Virtual Threads & non-blocking I/O",
    cachingLayer: "Redis session store & Caffeine L1 application cache",
    cloudLayer: "Distroless JVM container deployed on Railway",
  },
  {
    track: "Rust",
    projectName: "Raft Consensus Queue",
    schemaLayer: "Sled embedded KV engine with append-only write-ahead log",
    concurrencyLayer: "Tokio async multi-thread reactor with mpsc channels",
    cachingLayer: "In-memory lock-free DashMap cache",
    cloudLayer: "Scratch Linux x86_64 binary (8.4 MB footprint)",
  },
];

const LAYERS = [
  { id: "all", label: "Overview Matrix", icon: Layers },
  { id: "schema", label: "01. Data Schemas", icon: Database },
  { id: "concurrency", label: "02. Concurrency Safety", icon: Cpu },
  { id: "caching", label: "03. Distributed Caching", icon: Zap },
  { id: "cloud", label: "04. Cloud Packaging", icon: Cloud },
] as const;

export function CurriculumMatrixSection() {
  const [activeLayer, setActiveLayer] = useState<string>("all");

  return (
    <section className="py-20 sm:py-24 border-b border-white/[0.06] relative">
      {/* Section Header */}
      <div className="mb-12">
        <div className="mb-2.5 inline-flex">
          <span className="pill-mono">
            <Layers className="h-3 w-3 text-white" />
            <span>FULL ARCHITECTURAL SPECIFICATION</span>
          </span>
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          What you actually engineer in each stack.
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 max-w-xl">
          Compare the architectural layers covered across our curriculum. Every project takes you through real database design, concurrency controls, caching, and cloud delivery.
        </p>
      </div>

      {/* Layer Filter Pills (Boxless) */}
      <div className="mb-8 flex items-center gap-2 flex-wrap border-b border-white/[0.06] pb-4">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          const isSelected = activeLayer === layer.id;
          return (
            <button
              type="button"
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                isSelected
                  ? "bg-white text-black shadow-xs font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Boxless Architectural Stream / Table */}
      <div className="divide-y divide-white/[0.06]">
        {MATRIX_DATA.map((row) => (
          <div
            key={row.track}
            className="group py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-baseline transition-colors hover:bg-white/[0.01] -mx-4 px-4 rounded-xl"
          >
            {/* Track & Project Name (3 cols) */}
            <div className="lg:col-span-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white">
                <TechIcon name={row.track} className="h-4 w-4" />
              </div>
              <div>
                <div className="font-sans text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {row.projectName}
                </div>
                <div className="font-mono text-[10px] text-neutral-500">{row.track} Production Track</div>
              </div>
            </div>

            {/* Architecture Details (9 cols) */}
            <div className="lg:col-span-9">
              {activeLayer === "all" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="text-neutral-400">
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">01 Schema</span>
                    <span className="text-neutral-300">{row.schemaLayer}</span>
                  </div>
                  <div className="text-neutral-400">
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">02 Concurrency</span>
                    <span className="text-neutral-300">{row.concurrencyLayer}</span>
                  </div>
                  <div className="text-neutral-400">
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">03 Caching</span>
                    <span className="text-neutral-300">{row.cachingLayer}</span>
                  </div>
                  <div className="text-neutral-400">
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">04 Cloud</span>
                    <span className="text-emerald-400">{row.cloudLayer}</span>
                  </div>
                </div>
              ) : activeLayer === "schema" ? (
                <div className="text-xs font-mono text-neutral-200 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>{row.schemaLayer}</span>
                </div>
              ) : activeLayer === "concurrency" ? (
                <div className="text-xs font-mono text-neutral-200 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>{row.concurrencyLayer}</span>
                </div>
              ) : activeLayer === "caching" ? (
                <div className="text-xs font-mono text-neutral-200 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{row.cachingLayer}</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{row.cloudLayer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

