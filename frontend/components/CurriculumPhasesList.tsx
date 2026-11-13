"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Layers, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import type { ProgressController } from "@/hooks/useProgress";

interface CurriculumPhasesListProps {
  project: Project;
  progress: ProgressController;
}

function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    // Remove markdown headers e.g. ### Phase overview
    .replace(/^#+\s+/gm, "")
    // Remove bold and italics e.g. **Time:** or *important*
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove inline code e.g. `npm install`
    .replace(/`([^`]+)`/g, "$1")
    // Remove blockquotes e.g. > Note:
    .replace(/^>\s+/gm, "")
    // Remove markdown links e.g. [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove list markers
    .replace(/^[-*+]\s+/gm, "")
    // Remove leaked "Time: about..." phrases
    .replace(/Time:\s*about\s*[\d.]+\s*(hours?|minutes?)/gi, "")
    // Normalize newlines and collapse whitespace
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
            const rawSummary = phase.summary || phase.title;
            const cleanSummary = stripMarkdown(rawSummary);

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

                {/* Phase Main Layout: Left info + Right uniform metrics */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {isDone && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Phase Overview Summary (Markdown stripped) */}
                    {cleanSummary && (
                      <p className="mt-1.5 pl-6 text-xs leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300 line-clamp-2">
                        {cleanSummary}
                      </p>
                    )}
                  </div>

                  {/* Right rail metadata: ALWAYS identical on all phases */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
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
                    <ArrowRight className="h-3 w-3 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
