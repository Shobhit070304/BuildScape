import Link from "next/link";
import { Clock, Layers, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TechBadge } from "@/components/TechBadge";

interface ProjectCardProps {
  project: Project;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "text-neutral-300 bg-white/[0.04] border-white/10",
  Intermediate: "text-neutral-200 bg-white/[0.06] border-white/15",
  Advanced: "text-white bg-white/10 border-white/20",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const diffClass =
    DIFFICULTY_CLASSES[project.difficulty] ??
    "text-neutral-300 bg-white/[0.04] border-white/10";

  const phaseCount = project.phases?.length ?? 0;
  const visibleStack = project.techStack.slice(0, 3);
  const extraStack = project.techStack.length - 3;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0E0E14] shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
    >
      <div>
        {/* Meta Bar */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {project.category && (
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                {project.category}
              </span>
            )}
            <span className="text-neutral-600">·</span>
            <span
              className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[0.625rem] font-medium border ${diffClass}`}
            >
              {project.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs text-neutral-400">
            <Clock className="h-3 w-3 text-neutral-500" />
            <span>{project.estimatedHours}h</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-sans text-lg font-bold tracking-tight text-white transition-colors group-hover:text-neutral-100">
          {project.title}
        </h3>

        {/* Tagline */}
        <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-neutral-400 mb-6">
          {project.tagline}
        </p>
      </div>

      {/* Footer Area: Tech Stack + Navigation */}
      <div className="pt-4 border-t border-white/[0.08]">
        {/* Tech Stack Chips */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {visibleStack.map((tech) => (
            <TechBadge key={tech} name={tech} size="xs" showIcon={true} />
          ))}
          {extraStack > 0 && (
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.625rem] text-neutral-400">
              +{extraStack}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-xs text-neutral-400">
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>{phaseCount} phases</span>
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white transition-opacity group-hover:opacity-80">
            <span>Open Blueprint</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
