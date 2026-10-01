import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TechBadge } from "@/components/TechBadge";

interface ProjectCardProps {
  project: Project;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Entry: "text-sky-400 bg-sky-950/40 border-sky-800/60",
  Basic: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
  Intermediate: "text-amber-400 bg-amber-950/40 border-amber-800/60",
  Advanced: "text-rose-400 bg-rose-950/40 border-rose-800/60",
  Expert: "text-purple-400 bg-purple-950/40 border-purple-800/60",
  Beginner: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const diffClass =
    DIFFICULTY_CLASSES[project.difficulty] ??
    "text-amber-400 bg-amber-950/40 border-amber-800/60";

  const phaseCount = project.phases ? project.phases.length : 0;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-[#201d18] bg-[#11100e] p-3.5 transition-all duration-200 hover:border-[#332e26] hover:bg-[#14120f] shadow-xs"
    >
      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Main Technology Track with icon */}
          <TechBadge name={project.track} size="xs" />

          {/* Difficulty pill */}
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[0.62rem] font-medium ${diffClass}`}
          >
            {project.difficulty}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[0.68rem] text-[#6b6256]">
          <Clock className="h-3 w-3 text-[#6b6256]" />
          {project.estimatedHours}h
        </div>
      </div>

      {/* Title with font-serif */}
      <h3 className="mb-1 font-serif text-sm font-semibold leading-snug text-[#e4ddd3] transition-colors group-hover:text-white">
        {project.title}
      </h3>

      {/* Tagline */}
      <p className="mb-2.5 line-clamp-2 text-[11px] leading-relaxed text-[#8a8178]">
        {project.tagline}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#1e1c18] pt-2 text-xs">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <TechBadge key={tech} name={tech} size="xs" showIcon={false} />
          ))}
          {project.techStack.length > 3 && (
            <span className="rounded border border-[#221f1a] bg-[#14120f] px-1 py-0.2 text-[0.58rem] text-[#8a8178]">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[0.68rem] font-medium text-[#c9a96e] transition-colors group-hover:text-[#d4b577]">
          {phaseCount} phases
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
