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
import { getProjectBySlug, DIFFICULTY_COLORS } from "@/lib/projects";

export function FeaturedProjectsSection() {
  const featuredSlugs = [
    {
      slug: "springboot-kafka-ecommerce-microservices",
      icon: <Server className="h-4 w-4 text-emerald-400" />,
      accentBorder: "border-[#201d18] hover:border-emerald-800/60",
      highlight: "Event-Driven Microservices & Saga",
    },
    {
      slug: "golang-distributed-kv-raft",
      icon: <Database className="h-4 w-4 text-cyan-400" />,
      accentBorder: "border-[#201d18] hover:border-cyan-800/60",
      highlight: "Distributed Raft Consensus & gRPC",
    },
    {
      slug: "nextjs-saas-video-collaboration",
      icon: <Video className="h-4 w-4 text-amber-400" />,
      accentBorder: "border-[#201d18] hover:border-amber-800/60",
      highlight: "WebRTC Realtime Mesh & AI Transcribe",
    },
    {
      slug: "rust-distributed-lsm-storage",
      icon: <HardDrive className="h-4 w-4 text-orange-400" />,
      accentBorder: "border-[#201d18] hover:border-orange-800/60",
      highlight: "LSM Storage Engine, WAL & MemTable",
    },
  ];

  const featuredProjects = featuredSlugs
    .map((item) => {
      const proj = getProjectBySlug(item.slug);
      return proj ? { ...proj, ...item } : null;
    })
    .filter(Boolean);

  return (
    <section id="projects" className="mb-10 sm:mb-12 scroll-mt-20">
      {/* Section Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-0.5">
            <Sparkles className="h-3 w-3 text-[#c9a96e]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]">
              Curated Production Builds
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#e4ddd3]">
            Featured Systems You Can Build
          </h2>
          <p className="mt-0.5 text-xs text-[#8a8178]">
            Real software architectures built with the most demanded technologies. No basic to-do apps.
          </p>
        </div>

        <Link
          href="/projects"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a96e] transition-colors hover:text-[#d4b577]"
        >
          <span>Browse All 16+ Projects</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Flagship Projects Grid (Smaller, crisp cards) */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {featuredProjects.map((p) => {
          if (!p) return null;
          const diffColor =
            DIFFICULTY_COLORS[p.difficulty] ||
            "text-amber-400 bg-amber-950/50 border-amber-800/60";

          return (
            <div
              key={p.id}
              className={`group relative flex flex-col justify-between rounded-xl border bg-[#11100e] p-4 transition-all duration-200 hover:bg-[#14120f] hover:border-[#332e26] ${p.accentBorder}`}
            >
              <div>
                {/* Meta header */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411]">
                      {p.icon}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#6b6256]">
                        {p.track}
                      </span>
                      <div className="text-[10px] font-medium text-[#c9a96e]">
                        {p.highlight}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded border px-2 py-0.5 text-[9px] font-semibold ${diffColor}`}
                  >
                    {p.difficulty}
                  </span>
                </div>

                {/* Project Title with font-serif */}
                <h3 className="mb-1 font-serif text-sm sm:text-base font-semibold text-[#e4ddd3] group-hover:text-white transition-colors line-clamp-1">
                  {p.title}
                </h3>

                {/* Tagline / Simple summary */}
                <p className="mb-3 text-[11px] leading-relaxed text-[#8a8178] line-clamp-2">
                  {p.tagline}
                </p>

                {/* Tech stack badges */}
                <div className="mb-3 flex flex-wrap items-center gap-1">
                  {p.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-[#221f1a] bg-[#14120f] px-1.5 py-0.5 text-[10px] font-mono text-[#8a8178]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Phases, Hours, CTA */}
              <div className="flex items-center justify-between border-t border-[#1e1c18] pt-2.5">
                <div className="flex items-center gap-2.5 text-[10px] text-[#6b6256]">
                  <span className="flex items-center gap-1 font-mono">
                    <Layers className="h-3 w-3 text-[#c9a96e]" />
                    {p.phases.length} Phases
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-2.5 w-2.5 text-[#6b6256]" />
                    ~{p.estimatedHours}h
                  </span>
                </div>

                <Link
                  href={`/projects/${p.slug}`}
                  className="inline-flex items-center gap-1 rounded border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-2.5 py-1 text-xs font-semibold text-stone-950 transition-all shadow-xs"
                >
                  <span>Start Project</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Tracks Banner (Tighter, smaller) */}
      <div className="mt-3.5 flex flex-col items-center justify-between gap-2 rounded-lg border border-[#201d18] bg-[#11100e] p-3 px-4 text-center sm:flex-row sm:text-left">
        <span className="text-[11px] text-[#8a8178]">
          More tracks available:{" "}
          <strong className="text-[#d4cbbd]">Python MLOps, Express REST, React Bento Grids, and Tokio Async</strong>
        </span>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c9a96e] hover:text-[#d4b577] transition-colors whitespace-nowrap"
        >
          <span>Explore All Tracks →</span>
        </Link>
      </div>
    </section>
  );
}
