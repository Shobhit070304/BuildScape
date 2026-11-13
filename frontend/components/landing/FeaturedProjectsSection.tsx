import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { fetchProjectBySlugFromDb } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";

const FEATURED_SLUGS = [
  "habitly-go-rest-api",
  "spendwise-react-typescript",
  "jobtrail-springboot-react",
  "cardforge-fastapi-ai",
];

export async function FeaturedProjectsSection() {
  const resolved = await Promise.all(
    FEATURED_SLUGS.map(async (slug) => {
      const p = await fetchProjectBySlugFromDb(slug);
      return p ?? null;
    })
  );
  const projects = resolved.filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <section id="projects" className="py-20 sm:py-24 border-b border-white/[0.08] scroll-mt-24">
      {/* Section Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="mb-2.5 inline-flex">
            <span className="pill-mono">
              <Sparkles className="h-3 w-3 text-white" />
              <span>FEATURED PROJECTS</span>
            </span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Production Systems You Will Build
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
            Hands-on architectures with step-by-step milestone tracking, live code verification, and zero tutorial fluff.
          </p>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-white transition-colors hover:text-neutral-300 shrink-0"
        >
          <span>Explore All Projects</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Same Compact Project Cards Grid (2 per line, showcase mode) */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0E] p-8 text-center">
          <p className="text-xs text-neutral-400 mb-3">
            Loading flagship engineering projects from the database.
          </p>
          <Link href="/projects" className="btn-primary text-xs">
            <span>Explore Projects Library</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      )}
    </section>
  );
}
