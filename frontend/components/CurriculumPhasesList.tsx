"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects";
import { getPhaseDescription } from "@/lib/projects";
import { useProgress } from "@/hooks/useProgress";

interface CurriculumPhasesListProps {
  project: Project;
}

export function CurriculumPhasesList({ project }: CurriculumPhasesListProps) {
  const router = useRouter();
  // Reuse the same useProgress instance — no extra API call.
  const { enrolled } = useProgress(project.slug);

  const handleClick = (phaseId: string, phaseIndex: number) => {
    if (!enrolled) {
      // Highlight the enrollment box instead of navigating.
      const box = document.getElementById("enrollment-box");
      if (box) {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        box.classList.add("ring-2", "ring-amber-500", "transition-all", "duration-500");
        setTimeout(() => box.classList.remove("ring-2", "ring-amber-500"), 2000);
      }
      return;
    }
    router.push(`/projects/${project.slug}/workspace?phase=${phaseId}`);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#24211b] pb-3 mb-7">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#c9a96e] uppercase">
            ROADMAP
          </span>
          <div className="h-px w-12 bg-[#24211b] hidden sm:block" />
        </div>
        <span className="font-mono text-xs text-[#7a7168]">
          {project.phases.length} steps
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-7">
        {/* Continuous connector line */}
        <div className="absolute left-1.75 top-2.5 bottom-6 w-px bg-[#24211b]" />

        <div className="space-y-7">
          {project.phases.map((phase, idx) => {
            const stepNum = String(idx + 1).padStart(2, "0");
            const description = getPhaseDescription(phase);

            return (
              <div
                key={phase.id}
                onClick={() => handleClick(phase.id, idx)}
                className="group relative cursor-pointer select-none"
              >
                {/* Node */}
                <div className="absolute -left-6 sm:-left-6.75 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#3a352c] bg-[#09090b] transition-all duration-200 group-hover:border-[#c9a96e] group-hover:scale-110">
                  <div className="h-1 w-1 rounded-full bg-[#5a5246] group-hover:bg-[#c9a96e] transition-colors" />
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-xs font-medium text-[#7a7168] shrink-0">
                    {stepNum}
                  </span>
                  <h3 className="text-xs sm:text-[0.8125rem] font-semibold text-[#e4ddd3] transition-colors group-hover:text-[#ecd39e] leading-snug">
                    {phase.title}
                  </h3>
                </div>

                {description && (
                  <p className="mt-1 pl-7 text-xs leading-relaxed text-[#7a7168] transition-colors group-hover:text-[#a0978c] line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
