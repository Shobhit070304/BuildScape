import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
  Intermediate: "text-amber-400 bg-amber-950/40 border-amber-800/60",
  Advanced: "text-rose-400 bg-rose-950/40 border-rose-800/60",
};

const TRACK_CLASSES: Record<string, string> = {
  "Next.js": "text-sky-300 bg-sky-950/40 border-sky-800/60",
  "Node.js": "text-green-300 bg-green-950/40 border-green-800/60",
  React: "text-cyan-300 bg-cyan-950/40 border-cyan-800/60",
  Python: "text-amber-200 bg-amber-950/40 border-amber-800/60",
  Go: "text-teal-300 bg-teal-950/40 border-teal-800/60",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const diffClass =
    DIFFICULTY_CLASSES[project.difficulty] ??
    "text-amber-400 bg-amber-950/40 border-amber-800/60";
  const trackClass =
    TRACK_CLASSES[project.track] ??
    "text-[#a8a29e] bg-[#1e1e1e]/60 border-[#333333]";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-[#222222] bg-[#0e0e0e] p-6 transition-all duration-200 hover:border-[#383838] hover:bg-[#141414] hover:shadow-xl"
    >
      {/* Header row */}
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[0.7rem] font-medium ${trackClass}`}
          >
            {project.track}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[0.7rem] font-medium ${diffClass}`}
          >
            {project.difficulty}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#7a7168]">
          <Clock className="h-3.5 w-3.5" />
          {project.estimatedHours}h
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-serif text-lg font-semibold leading-snug text-[#e4ddd3] transition-colors group-hover:text-amber-200">
        {project.title}
      </h3>

      {/* Tagline */}
      <p className="mb-5 line-clamp-2 text-xs leading-relaxed text-[#8a8178]">
        {project.tagline}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-3">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded border border-[#222222] bg-[#171717] px-2 py-0.5 text-[0.68rem] text-[#8a8178]"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="rounded border border-[#222222] bg-[#171717] px-2 py-0.5 text-[0.68rem] text-[#7a7168]">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-[#7a7168] transition-colors group-hover:text-[#c9a96e]">
          {project.phases.length} phases
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
