"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import type { ComponentProps, ReactNode } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  NotebookPen,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import type { Project, Phase } from "@/lib/projects";
import { useProgress } from "@/hooks/useProgress";
import { api } from "@/lib/api";
import { AIHelpDrawer } from "@/components/AIHelpDrawer";
import { ProjectNotesPanel } from "@/components/ProjectNotesPanel";

function textFromMarkdownNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromMarkdownNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textFromMarkdownNode((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function CopyableCodeBlock({ children, ...props }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textFromMarkdownNode(children));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="group relative">
      <button type="button" onClick={() => void copy()} aria-label={copied ? "Code copied" : "Copy code"} className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-surface-card/90 px-2 py-1 text-[11px] text-text-muted opacity-100 transition hover:text-text sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
}

const mdComponents: Components = {
  pre: CopyableCodeBlock,
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-accent underline underline-offset-[3px] transition-colors hover:text-accent-hover"
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
          : "border-transparent bg-transparent hover:bg-surface-raised"
      }`}
    >
      {/* Phase number / check icon */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[0.6rem] font-bold ${
              isActive
                ? "border-amber-700 text-accent"
                : "border-[#3a3530] text-text-faint"
            }`}
          >
            {index + 1}
          </div>
        )}
      </div>

      <span
        className={`text-[0.8125rem] leading-snug ${
          isActive
            ? "font-medium text-accent-hover"
            : isCompleted
            ? "text-text-faint line-through decoration-[#3a3530]"
            : "text-text-muted"
        }`}
      >
        {phase.title}
      </span>
    </button>
  );
}

interface PhaseViewerProps {
  project: Project;
  initialPhaseId?: string;
}

export function PhaseViewer({ project, initialPhaseId }: PhaseViewerProps) {
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const closeAIHelp = useCallback(() => setIsAIHelpOpen(false), []);
  const getInitialIdx = () => {
    if (!initialPhaseId) return 0;
    const idx = project.phases.findIndex(
      (p) => p.id === initialPhaseId || String(p.orderIndex) === initialPhaseId
    );
    return idx !== -1 ? idx : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIdx);
  const [phaseSelectionReady, setPhaseSelectionReady] = useState(false);
  const {
    completed,
    hydrated,
    currentPhaseIndex,
    togglePhase,
    isCompleted,
    clearProgress,
  } = useProgress(project.slug);

  useEffect(() => {
    if (!hydrated) return;
    const requestedIndex = initialPhaseId
      ? project.phases.findIndex((p) => p.id === initialPhaseId || String(p.orderIndex) === initialPhaseId)
      : -1;
    const nextIndex = requestedIndex >= 0 ? requestedIndex : currentPhaseIndex;
    setActiveIndex(Math.max(0, Math.min(project.phases.length - 1, nextIndex)));
    setPhaseSelectionReady(true);
  }, [hydrated, currentPhaseIndex, initialPhaseId, project.phases]);

  useEffect(() => {
    if (!phaseSelectionReady || !hydrated || !project.phases[activeIndex]) return;
    const phaseId = project.phases[activeIndex].id;
    const timer = window.setTimeout(() => {
      api.setCurrentPhase(project.slug, phaseId).catch((err) => {
        console.error("Failed to save current phase:", err);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hydrated, phaseSelectionReady, project.phases, project.slug]);

  const activePhase = project.phases[activeIndex];
  const totalPhases = project.phases.length;
  const completedCount = completed.length;
  const progressPct = totalPhases > 0 ? (completedCount / totalPhases) * 100 : 0;
  if (!activePhase) {
    return <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#0a0a0a] p-6 text-center text-sm text-text-muted">This project has no phases yet.</div>;
  }

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
            <BookOpen className="h-3 w-3 text-text-faint" />
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-text-faint">
              {project.track}
            </span>
          </div>
          <h2 className="mb-3 font-serif text-sm font-semibold leading-snug text-[#e4ddd3]">
            {project.title}
          </h2>

          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex justify-between text-[0.7rem] text-text-faint">
              <span>Progress</span>
              <span>
                {hydrated ? completedCount : 0}/{totalPhases}
              </span>
            </div>
            <div className="h-0.75 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
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
              className="flex cursor-pointer items-center gap-1.5 text-xs text-text-faint transition-colors hover:text-text-muted"
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
            <span className="whitespace-nowrap font-mono text-[0.7rem] text-text-faint">
              Phase {activeIndex + 1}/{totalPhases}
            </span>
            <h1 className="truncate font-serif text-[0.9375rem] font-semibold text-[#e4ddd3]">
              {activePhase.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNotesOpen((open) => !open)}
              aria-pressed={isNotesOpen}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${isNotesOpen ? "border-amber-700/50 bg-amber-950/20 text-accent" : "border-border text-text-muted hover:border-border-hover hover:text-text"}`}
            >
              <NotebookPen className="h-3.5 w-3.5" />
              <span>Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAIHelpOpen(true)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-amber-700/50 hover:bg-amber-950/20 hover:text-accent"
              aria-label={`Get AI help for ${activePhase.title}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI help</span>
            </button>
            {hydrated && (
              <button
                onClick={() => togglePhase(activePhase.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isCompleted(activePhase.id)
                    ? "border-emerald-700/40 bg-emerald-950/20 text-success"
                    : "border-amber-800/50 bg-amber-950/25 text-accent hover:bg-amber-900/35"
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
        </div>

        {/* Markdown content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-10">
          {/* Centered content wrapper */}
          <div className={isNotesOpen ? "hidden" : "mx-auto w-full max-w-6xl"}>
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
          <div className={isNotesOpen ? "block" : "hidden"}>
            <ProjectNotesPanel
              key={project.slug}
              slug={project.slug}
              projectTitle={project.title}
              open={isNotesOpen}
              onSaved={() => setIsNotesOpen(false)}
            />
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
                : "cursor-pointer text-text-muted hover:text-[#e4ddd3]"
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
                    ? "w-4 bg-accent"
                    : hydrated && isCompleted(phase.id)
                    ? "w-1.5 bg-success"
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
                : "cursor-pointer text-text-muted hover:text-[#e4ddd3]"
            }`}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <AIHelpDrawer
        key={activePhase.id}
        project={project}
        phase={activePhase}
        phaseIndex={activeIndex}
        open={isAIHelpOpen}
        onClose={closeAIHelp}
      />
    </div>
  );
}
