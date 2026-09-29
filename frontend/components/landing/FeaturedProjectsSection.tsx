import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects } from "@/lib/projects";

export function FeaturedProjectsSection() {
  const projects = getAllProjects();

  return (
    <section id="projects" className="mb-24 scroll-mt-20">
      {/* Section Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-800/30 bg-amber-950/25 px-3 py-1">
            <Layers className="h-3.5 w-3.5 text-[#c9a96e]" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#d4b577]">
              Curated Curriculum
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#f0eae1] sm:text-4xl">
            Featured Full-Stack Projects
          </h2>
          <p className="mt-2 text-xs text-[#8a8178] sm:text-sm">
            Complete, end-to-end architectures designed to build true engineering confidence.
          </p>
        </div>

        <Link
          href="/projects"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a96e] transition-colors hover:text-[#d4b577]"
        >
          <span>Browse all tracks</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {/* Upcoming tracks strip */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-dashed border-[#26221c] bg-[#11100e] p-4 px-6 text-center sm:flex-row sm:text-left">
        <span className="text-xs text-[#8a8178]">
          🚀 Next tracks in development: <strong className="text-[#c4bbb0]">Distributed Task Queues, GraphQL Engines, and Microservices</strong>
        </span>
        <span className="rounded-full bg-[#181613] px-2.5 py-0.5 font-mono text-[0.68rem] text-[#6b6256] border border-[#26221c]">
          in progress
        </span>
      </div>
    </section>
  );
}
