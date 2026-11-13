import Link from "next/link";
import { Users, Layers } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TechIcon } from "@/components/TechBadge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks =
    project.phases?.reduce((acc, p) => acc + (p.tasks?.length ?? 0), 0) ||
    project.phases?.length * 5 ||
    15;

  const realLearners =
    typeof project.learnerCount === "number" && project.learnerCount > 0
      ? project.learnerCount
      : null;
  const isFree = true; // All curriculum projects are free access

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
    >
      <div>
        {/* Top Header: Title on Left, FREE / PRO Pill on Right */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-sans text-base sm:text-[17px] font-bold text-white transition-colors group-hover:text-neutral-100 leading-snug">
            {project.title}
          </h3>
          <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {isFree ? "FREE" : "PRO"}
          </span>
        </div>

        {/* Clean, Scaled Description */}
        <p className="line-clamp-3 text-xs sm:text-[13px] leading-relaxed text-neutral-400 mb-5">
          {project.tagline || project.description}
        </p>
      </div>

      {/* Bottom Footer Capsules */}
      <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-white/[0.06]">
        {/* Track Capsule with Genuine Brand Logo */}
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-neutral-200 transition-colors group-hover:border-white/20">
          <TechIcon name={project.track} className="h-3.5 w-3.5 shrink-0" />
          <span>{project.track}</span>
        </span>

        {/* Tasks Count Capsule */}
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-neutral-300">
          <Layers className="h-3 w-3 text-neutral-500" />
          <span>{totalTasks} Tasks</span>
        </span>

        {/* Level Capsule */}
        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-neutral-300">
          {project.difficulty}
        </span>

        {/* Real Learners Count Capsule - only rendered when real enrolled learners exist */}
        {realLearners && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-neutral-400">
            <Users className="h-3 w-3 text-neutral-500" />
            <span>{realLearners.toLocaleString()}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
