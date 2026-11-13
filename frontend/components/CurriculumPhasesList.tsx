"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Layers, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/projects";
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
      const box = document.getElementById("enrollment-box");
      if (box) {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        box.classList.add("ring-2", "ring-white", "transition-all", "duration-500");
        setTimeout(() => box.classList.remove("ring-2", "ring-white"), 2000);
      }
      return;
    }
    router.push(`/projects/${project.slug}/workspace?phase=${phaseId}`);
  };

  const totalTasks = project.phases.reduce((acc, p) => acc + (p.tasks?.length ?? 0), 0);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
            CURRICULUM ROADMAP
          </span>
          <div className="h-px w-12 bg-white/10 hidden sm:block" />
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
          <span>{project.phases.length} Phases</span>
          {totalTasks > 0 && <span>• {totalTasks} Tasks</span>}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-7">
        {/* Continuous connector line */}
        <div className="absolute left-1.75 top-3 bottom-6 w-px bg-white/10" />

        <div className="space-y-3.5">
          {project.phases.map((phase, idx) => {
            const stepNum = String(idx + 1).padStart(2, "0");
            const isDone = hydrated && completed.includes(phase.id);
            const estTime = phase.estimatedMinutes
              ? phase.estimatedMinutes >= 60
                ? `${Math.round(phase.estimatedMinutes / 60)}h`
                : `${phase.estimatedMinutes}m`
              : null;
            const taskCount = phase.tasks?.length ?? 0;
            const summaryText = phase.summary || phase.title;

            return (
              <button
                type="button"
                key={phase.id}
                onClick={() => handleClick(phase.id)}
                aria-label={`Open phase ${idx + 1}: ${phase.title}`}
                className="group relative w-full cursor-pointer select-none rounded-xl border border-transparent p-3.5 text-left transition-all hover:border-white/15 hover:bg-white/[0.03]"
              >
                {/* Node */}
                <div
                  className={`absolute -left-6 sm:-left-6.75 top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-[#050507] transition-all duration-200 group-hover:scale-125 ${
                    isDone
                      ? "border-emerald-500 text-emerald-400 shadow-xs shadow-emerald-500/30"
                      : "border-white/20 group-hover:border-white"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 bg-[#050507]" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 transition-colors group-hover:bg-white" />
                  )}
                </div>

                {/* Phase Header */}
                <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs font-semibold text-neutral-500 shrink-0">
                      {stepNum}
                    </span>
                    <h3
                      className={`text-sm font-semibold transition-colors group-hover:text-white leading-snug ${
                        isDone ? "text-emerald-300" : "text-white"
                      }`}
                    >
                      {phase.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {estTime && (
                      <span className="inline-flex items-center gap-1 font-mono text-[0.625rem] text-neutral-400">
                        <Clock className="h-2.5 w-2.5 text-neutral-500" />
                        {estTime}
                      </span>
                    )}
                    {taskCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] border border-white/10 px-1.5 py-0.5 font-mono text-[0.625rem] text-neutral-300">
                        <Layers className="h-2.5 w-2.5 text-neutral-400" />
                        {taskCount} tasks
                      </span>
                    )}
                    {isDone && (
                      <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[0.625rem] font-medium text-emerald-300">
                        Completed
                      </span>
                    )}
                    <ArrowRight className="h-3 w-3 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </div>

                {/* Phase Overview Summary */}
                {summaryText && (
                  <p className="mt-1.5 pl-6 text-xs leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300 line-clamp-2">
                    {summaryText}
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
