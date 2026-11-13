import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Server,
  Database,
  Cpu,
  Layout,
} from "lucide-react";
import { fetchProjectBySlugFromDb } from "@/lib/projects";
import { TechBadge } from "@/components/TechBadge";
import type { ReactNode } from "react";

interface FeaturedSlug {
  slug: string;
  icon: ReactNode;
  highlight: string;
}

const FEATURED: FeaturedSlug[] = [
  {
    slug: "spendwise-react-typescript",
    icon: <Layout className="h-4 w-4 text-white" />,
    highlight: "React 19, TypeScript, Zod & Recharts",
  },
  {
    slug: "habitly-go-rest-api",
    icon: <Server className="h-4 w-4 text-white" />,
    highlight: "Go 1.23, Chi, PostgreSQL & JWT Auth",
  },
  {
    slug: "jobtrail-springboot-react",
    icon: <Database className="h-4 w-4 text-white" />,
    highlight: "Spring Boot 3.5, JPA & React TanStack",
  },
  {
    slug: "cardforge-fastapi-ai",
    icon: <Cpu className="h-4 w-4 text-white" />,
    highlight: "FastAPI, Anthropic SDK & Spaced Repetition",
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
      {/* Header — Centered, Scaled & Crisp */}
      <div className="mb-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="mb-2.5 inline-flex">
          <span className="pill-mono">
            <Sparkles className="h-3 w-3 text-white" />
            <span>FLAGSHIP BLUEPRINTS</span>
          </span>
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Featured Systems You Can Build
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Real software architectures with full source code guidance. No generic toy to-do apps.
        </p>
      </div>

      {/* Grid or Fallback */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0E] p-8 text-center">
          <p className="text-xs text-neutral-400 mb-3">
            Loading blueprints from database. Explore our complete curriculum library.
          </p>
          <Link href="/projects" className="btn-primary text-xs">
            <span>Explore All Blueprints</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((p) => {
            if (!p) return null;

            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0E0E14] shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                <div>
                  {/* Meta */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-xs">
                        {p.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                          {p.track}
                        </span>
                        <div className="text-xs font-semibold text-white">{p.highlight}</div>
                      </div>
                    </div>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium text-neutral-300">
                      {p.difficulty}
                    </span>
                  </div>

                  <h3 className="mb-2 font-sans text-lg font-bold leading-snug text-white group-hover:text-neutral-100 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="mb-5 text-xs sm:text-sm leading-relaxed text-neutral-400 line-clamp-2">{p.tagline}</p>

                  {/* Tech stack with Real Icons */}
                  <div className="mb-5 flex flex-wrap items-center gap-1.5">
                    {p.techStack.slice(0, 4).map((tech) => (
                      <TechBadge key={tech} name={tech} size="xs" showIcon={true} />
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                    <span className="flex items-center gap-1 text-neutral-300">
                      <Layers className="h-3.5 w-3.5 text-white" />
                      {p.phases.length} Phases
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Clock className="h-3.5 w-3.5" />
                      ~{p.estimatedHours}h
                    </span>
                  </div>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="btn-primary py-1.5! px-3.5! text-xs!"
                  >
                    Start Blueprint
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* More tracks banner */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] px-6 py-4 text-center sm:flex-row sm:text-left shadow-lg shadow-black/40">
        <span className="text-xs text-neutral-400 font-mono">
          Also available:{" "}
          <strong className="text-neutral-200 font-semibold">LogScope (Rust CLI), SnipURL (Go), and WriteSpace (Next.js Blog)</strong>
        </span>
        <Link
          href="/projects"
          className="text-xs font-semibold text-white hover:underline transition-colors whitespace-nowrap"
        >
          View all 7 curriculum projects →
        </Link>
      </div>
    </section>
  );
}
