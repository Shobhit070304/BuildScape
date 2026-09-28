"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Trophy,
} from "lucide-react";
import type { Project, Phase } from "@/lib/projects";
import { useProgress } from "@/hooks/useProgress";

const mdComponents: Components = {
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-[#c9a96e] underline underline-offset-[3px] transition-colors hover:text-[#d4b577]"
        {...props}
      >
        {children}
      </a>
    );
  },
};

function PhaseSidebarItem({
  phase,
  index,
  isActive,
  isCompleted,
  onClick,
}: {
  phase: Phase;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg border p-2 text-left transition-all ${
        isActive
          ? "border-amber-800/50 bg-amber-950/25"
          : "border-transparent bg-transparent hover:bg-[#141414]"
      }`}
    >
      {/* Phase number / check icon */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-[#5a9c6f]" />
        ) : (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[0.6rem] font-bold ${
              isActive
                ? "border-amber-700 text-[#c9a96e]"
                : "border-[#3a3530] text-[#4a4540]"
            }`}
          >
            {index + 1}
          </div>
        )}
      </div>

      <span
        className={`text-[0.8125rem] leading-snug ${
          isActive
            ? "font-medium text-[#d4b577]"
            : isCompleted
            ? "text-[#4a4540] line-through decoration-[#3a3530]"
            : "text-[#7a7168]"
        }`}
      >
        {phase.title}
      </span>
    </button>
  );
}

interface PhaseViewerProps {
  project: Project;
}

export function PhaseViewer({ project }: PhaseViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { completed, hydrated, togglePhase, isCompleted, clearProgress } =
    useProgress(project.slug);

  const activePhase = project.phases[activeIndex];
  const totalPhases = project.phases.length;
  const completedCount = completed.length;
  const progressPct = totalPhases > 0 ? (completedCount / totalPhases) * 100 : 0;
  const allDone = completedCount === totalPhases;

  const goTo = (i: number) => {
    if (i >= 0 && i < totalPhases) setActiveIndex(i);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-[#1a1a1a] bg-[#0d0d0d]">
        {/* Project info header */}
        <div className="shrink-0 border-b border-[#1a1a1a] p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-[#4a4540]" />
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-[#4a4540]">
              {project.track}
            </span>
          </div>
          <h2 className="mb-3 font-serif text-sm font-semibold leading-snug text-[#e4ddd3]">
            {project.title}
          </h2>

          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex justify-between text-[0.7rem] text-[#4a4540]">
              <span>Progress</span>
              <span>
                {hydrated ? completedCount : 0}/{totalPhases}
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#1e1e1e]">
              <div
                className="h-full rounded-full bg-amber-800 transition-all duration-500 ease-out"
                style={{ width: hydrated ? `${progressPct}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        {/* Phase list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {project.phases.map((phase, i) => (
            <PhaseSidebarItem
              key={phase.id}
              phase={phase}
              index={i}
              isActive={i === activeIndex}
              isCompleted={hydrated && isCompleted(phase.id)}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>

        {/* Reset progress */}
        {hydrated && completedCount > 0 && (
          <div className="shrink-0 border-t border-[#1a1a1a] p-3 px-4">
            <button
              onClick={clearProgress}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-[#4a4540] transition-colors hover:text-[#7a7168]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset progress
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Phase header bar */}
        <div className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0e0e0e] px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap font-mono text-[0.7rem] text-[#4a4540]">
              Phase {activeIndex + 1}/{totalPhases}
            </span>
            <h1 className="truncate font-serif text-[0.9375rem] font-semibold text-[#e4ddd3]">
              {activePhase.title}
            </h1>
          </div>

          {hydrated && (
            <button
              onClick={() => togglePhase(activePhase.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isCompleted(activePhase.id)
                  ? "border-emerald-700/40 bg-emerald-950/20 text-[#5a9c6f]"
                  : "border-amber-800/50 bg-amber-950/25 text-[#c9a96e] hover:bg-amber-900/35"
              }`}
            >
              {isCompleted(activePhase.id) ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Mark complete
                </>
              )}
            </button>
          )}
        </div>

        {/* Markdown content */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          {/* Centered content wrapper */}
          <div className="mx-auto max-w-[52rem]">
            {allDone && hydrated && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 px-4">
                <Trophy className="h-4 w-4 shrink-0 text-[#5a9c6f]" />
                <p className="text-sm text-emerald-400">
                  You have completed all phases of this project. Excellent work!
                </p>
              </div>
            )}

            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={mdComponents}
              >
                {activePhase.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-[#1a1a1a] bg-[#0e0e0e] px-6">
          <button
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              activeIndex === 0
                ? "cursor-not-allowed text-[#2a2520]"
                : "cursor-pointer text-[#7a7168] hover:text-[#e4ddd3]"
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {project.phases.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => goTo(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === activeIndex
                    ? "w-4 bg-[#c9a96e]"
                    : hydrated && isCompleted(phase.id)
                    ? "w-1.5 bg-[#5a9c6f]"
                    : "w-1.5 bg-[#2a2520] hover:bg-[#3a3530]"
                }`}
                aria-label={`Go to phase ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === totalPhases - 1}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              activeIndex === totalPhases - 1
                ? "cursor-not-allowed text-[#2a2520]"
                : "cursor-pointer text-[#7a7168] hover:text-[#e4ddd3]"
            }`}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
