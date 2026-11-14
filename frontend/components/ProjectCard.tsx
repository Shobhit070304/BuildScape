"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, ArrowUpRight, Bookmark } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TechIcon } from "@/components/TechBadge";
import { useAuth } from "@/context/AuthContext";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { savedProjects, toggleSaveProject, user } = useAuth();
  const isSaved = savedProjects.includes(project.slug);

  const totalTasks =
    project.phases?.reduce((acc, p) => acc + (p.tasks?.length ?? 0), 0) ||
    project.phases?.length * 5 ||
    15;

  const realLearners =
    typeof project.learnerCount === "number" && project.learnerCount > 0
      ? project.learnerCount
      : null;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/profile");
      return;
    }
    await toggleSaveProject(project.slug);
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0C0D14]/90 to-[#07070A]/95 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:from-[#10121C] hover:to-[#0A0A0F] shadow-lg shadow-black/60 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent hover:before:via-indigo-500/40"
    >
      <div>
        {/* Top Header: Title & Free/Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-sans text-base sm:text-[17px] font-bold text-white transition-colors group-hover:text-neutral-100 leading-snug">
            {project.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleBookmark}
              title={isSaved ? "Saved to your queue" : "Save to build queue"}
              className={`rounded-md p-1 transition-all ${
                isSaved
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-neutral-500 hover:text-white opacity-50 group-hover:opacity-100"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-indigo-400" : ""}`} />
            </button>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
              FREE
            </span>
          </div>
        </div>

        {/* Clean Description */}
        <p className="line-clamp-2 text-xs sm:text-[13px] leading-relaxed text-neutral-400 mb-6">
          {project.tagline || project.description}
        </p>
      </div>

      {/* Bottom Metadata - Sleek & Borderless */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-neutral-400">
          {/* Track with Brand Logo */}
          <span className="inline-flex items-center gap-1.5 font-medium text-neutral-200">
            <TechIcon name={project.track} className="h-3.5 w-3.5 shrink-0" />
            <span>{project.track}</span>
          </span>

          <span className="text-neutral-600">·</span>

          {/* Level */}
          <span className="text-neutral-300">
            {project.difficulty}
          </span>

          <span className="text-neutral-600">·</span>

          {/* Tasks */}
          <span className="text-neutral-400">
            {totalTasks} tasks
          </span>

          {/* Real Learners (if any) */}
          {realLearners && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="inline-flex items-center gap-1 text-neutral-400">
                <Users className="h-3 w-3 text-neutral-500" />
                <span>{realLearners.toLocaleString()}</span>
              </span>
            </>
          )}
        </div>

        <ArrowUpRight className="h-4 w-4 text-neutral-500 transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-2" />
      </div>
    </Link>
  );
}
