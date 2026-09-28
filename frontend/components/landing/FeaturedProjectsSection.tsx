import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects } from "@/lib/projects";

export function FeaturedProjectsSection() {
  const projects = getAllProjects();

  return (
    <section id="projects" className="py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-[#7a7168]">
            Available now
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#e4ddd3] sm:text-3xl">
            Start with a real project
          </h2>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-[0.8125rem] text-[#c9a96e] transition-colors hover:text-[#d4b577]"
        >
          All projects <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-dashed border-[#1d1d1d] p-4 px-6">
        <span className="text-sm text-[#7a7168]">
          More projects coming — React, Go, Python, Databases, DevOps
        </span>
        <span className="font-mono text-xs text-[#4a4540]">soon™</span>
      </div>
    </section>
  );
}
