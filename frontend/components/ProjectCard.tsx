import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TechBadge } from "@/components/TechBadge";

interface ProjectCardProps {
  project: Project;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
  Intermediate: "text-amber-400 bg-amber-950/40 border-amber-800/60",
  Advanced: "text-rose-400 bg-rose-950/40 border-rose-800/60",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const diffClass =
    DIFFICULTY_CLASSES[project.difficulty] ??
    "text-amber-400 bg-amber-950/40 border-amber-800/60";

  const phaseCount = project.phases ? project.phases.length : 0;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-[#222222] bg-[#0e0e0e] p-4 sm:p-5 transition-all duration-200 hover:border-[#383838] hover:bg-[#141414] hover:shadow-xl"
    >
      {/* Header row */}
      <div className="mb-2.5 flex items-start justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Main Technology Track with icon */}
          <TechBadge name={project.track} size="xs" />

          {/* Difficulty pill */}
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-medium ${diffClass}`}
          >
            {project.difficulty}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[0.72rem] text-[#7a7168]">
          <Clock className="h-3 w-3" />
          {project.estimatedHours}h
        </div>
      </div>

      {/* Title (Slightly smaller, modern sans-serif) */}
      <h3 className="mb-1.5 text-[0.95rem] font-semibold leading-snug text-[#e4ddd3] transition-colors group-hover:text-amber-200">
        {project.title}
      </h3>

      {/* Tagline */}
      <p className="mb-3.5 line-clamp-2 text-[0.78rem] leading-relaxed text-[#8a8178]">
        {project.tagline}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-2.5">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <TechBadge key={tech} name={tech} size="xs" showIcon={false} />
          ))}
          {project.techStack.length > 3 && (
            <span className="rounded border border-[#222222] bg-[#171717] px-1.5 py-0.5 text-[0.62rem] text-[#7a7168]">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[0.72rem] font-medium text-[#7a7168] transition-colors group-hover:text-[#c9a96e]">
          {phaseCount} phases
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
