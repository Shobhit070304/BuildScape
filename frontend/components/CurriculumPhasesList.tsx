"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { getPhaseDescription } from "@/lib/projects";
import type { ProgressController } from "@/hooks/useProgress";

interface CurriculumPhasesListProps {
  project: Project;
  progress: ProgressController;
}

export function CurriculumPhasesList({ project, progress }: CurriculumPhasesListProps) {
  const router = useRouter();
  const { enrolled, completed, hydrated } = progress;

  const handleClick = (phaseId: string) => {
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
            const isDone = hydrated && completed.includes(phase.id);

            return (
              <button
                type="button"
                key={phase.id}
                onClick={() => handleClick(phase.id)}
                aria-label={`Open phase ${idx + 1}: ${phase.title}`}
                className="group relative w-full cursor-pointer select-none text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
              >
                {/* Node */}
                <div className={`absolute -left-6 sm:-left-6.75 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-[#09090b] transition-all duration-200 group-hover:scale-110 ${isDone ? "border-emerald-700 text-emerald-400" : "border-[#3a352c] group-hover:border-[#c9a96e]"}`}>
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5 bg-[#09090b]" /> : <div className="h-1 w-1 rounded-full bg-[#5a5246] transition-colors group-hover:bg-[#c9a96e]" />}
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-xs font-medium text-[#7a7168] shrink-0">
                    {stepNum}
                  </span>
                  <h3 className={`text-xs sm:text-[0.8125rem] font-semibold transition-colors group-hover:text-[#ecd39e] leading-snug ${isDone ? "text-emerald-300" : "text-[#e4ddd3]"}`}>
                    {phase.title}
                  </h3>
                  {isDone && <span className="shrink-0 rounded-full border border-emerald-900/60 bg-emerald-950/30 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">Done</span>}
                </div>

                {description && (
                  <p className="mt-1 pl-7 text-xs leading-relaxed text-[#7a7168] transition-colors group-hover:text-[#a0978c] line-clamp-2">
                    {description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
