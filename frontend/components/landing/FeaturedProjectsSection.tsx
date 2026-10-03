import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Server,
  Database,
  Video,
  HardDrive,
} from "lucide-react";
import { fetchProjectBySlugFromDb, DIFFICULTY_COLORS } from "@/lib/projects";
import type { ReactNode } from "react";

interface FeaturedSlug {
  slug: string;
  icon: ReactNode;
  accentHover: string;
  highlight: string;
}

const FEATURED: FeaturedSlug[] = [
  {
    slug: "spring-kafka-banking-ledger",
    icon: <Server className="h-4 w-4 text-emerald-400" />,
    accentHover: "hover:border-emerald-800/50",
    highlight: "Event-Driven Microservices & Kafka",
  },
  {
    slug: "go-raft-distributed-kv-store",
    icon: <Database className="h-4 w-4 text-cyan-400" />,
    accentHover: "hover:border-cyan-800/50",
    highlight: "Distributed Raft Consensus & gRPC",
  },
  {
    slug: "nextjs-collaborative-canvas",
    icon: <Video className="h-4 w-4 text-amber-400" />,
    accentHover: "hover:border-amber-800/50",
    highlight: "WebSocket Realtime Collaboration",
  },
  {
    slug: "rust-lsm-tree-kv-engine",
    icon: <HardDrive className="h-4 w-4 text-orange-400" />,
    accentHover: "hover:border-orange-800/50",
    highlight: "LSM Storage Engine, WAL & MemTable",
  },
];


export async function FeaturedProjectsSection() {
  const resolved = await Promise.all(
    FEATURED.map(async (item) => {
      const p = await fetchProjectBySlugFromDb(item.slug);
      return p ? { ...p, ...item } : null;
    })
  );
  const projects = resolved.filter(Boolean);

  return (
    <section id="projects" className="mb-20 sm:mb-28 lg:mb-32 scroll-mt-24">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex">
            <span className="pill-amber">
              <Sparkles className="h-2.5 w-2.5" />
              Curated Production Builds
            </span>
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Featured Systems You Can Build
          </h2>
          <p className="mt-1 text-[0.8125rem] text-text-muted">
            Real software architectures. No basic to-do apps.
          </p>
        </div>
        <Link
          href="/projects"
          className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-accent transition-colors hover:text-accent-hover whitespace-nowrap"
        >
          Browse All Projects
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => {
          if (!p) return null;
          const diffColor =
            DIFFICULTY_COLORS[p.difficulty] ?? "text-amber-400 bg-amber-950/50 border-amber-800/60";

          return (
            <div
              key={p.id}
              className={`group flex flex-col justify-between rounded-2xl border border-border bg-surface-card p-4 sm:p-5 transition-all duration-200 hover:bg-[#141413] ${p.accentHover}`}
            >
              <div>
                {/* Meta */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-[#161615]">
                      {p.icon}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#5a5450]">
                        {p.track}
                      </span>
                      <div className="text-[10px] font-medium text-accent">{p.highlight}</div>
                    </div>
                  </div>
                  <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold ${diffColor}`}>
                    {p.difficulty}
                  </span>
                </div>

                <h3 className="mb-1.5 font-serif text-base font-semibold leading-snug text-text group-hover:text-white transition-colors line-clamp-1">
                  {p.title}
                </h3>
                <p className="mb-3.5 text-xs leading-relaxed text-text-muted line-clamp-2">{p.tagline}</p>

                {/* Tech stack */}
                <div className="mb-3.5 flex flex-wrap items-center gap-1">
                  {p.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border bg-[#141413] px-1.5 py-0.5 font-mono text-[9px] text-[#8a8178]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 text-[10px] text-[#5a5450] font-mono">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-accent" />
                    {p.phases.length} Phases
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{p.estimatedHours}h
                  </span>
                </div>
                <Link
                  href={`/projects/${p.slug}`}
                  className="btn-primary py-1.5! px-3! text-xs!"
                >
                  Start Project
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* More tracks banner */}
      <div className="mt-4 flex flex-col items-center justify-between gap-2 rounded-xl border border-border bg-surface-card px-5 py-3 text-center sm:flex-row sm:text-left">
        <span className="text-xs text-text-muted">
          More tracks:{" "}
          <strong className="text-[#d4cbbd]">Python MLOps, Express REST, React, Tokio Async</strong>
        </span>
        <Link
          href="/projects"
          className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors whitespace-nowrap"
        >
          Explore All Tracks →
        </Link>
      </div>
    </section>
  );
}
