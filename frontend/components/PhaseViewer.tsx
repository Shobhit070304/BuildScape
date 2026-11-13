"use client";

import { useState, useEffect, useRef } from "react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  FileText,
  Flag,
  Save,
  X,
  Sparkles,
  Layers,
  Trash2,
  Clock,
  Check,
  ShieldCheck,
  Award,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import type { Project, Phase } from "@/lib/projects";
import type { ProgressController } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";
import { AssistantDrawer } from "./AssistantDrawer";
import { MarkdownContent } from "./MarkdownContent";
import { ProjectVerificationModal } from "./ProjectVerificationModal";
import { api, type CurriculumIssueCategory } from "@/lib/api";

function PhaseSidebarItem({
  phase,
  index,
  isActive,
  isCompleted,
  completedTasksCount = 0,
  onClick,
}: {
  phase: Phase;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  completedTasksCount?: number;
  onClick: () => void;
}) {
  const estTime = phase.estimatedMinutes
    ? phase.estimatedMinutes >= 60
      ? `${Math.round(phase.estimatedMinutes / 60)}h`
      : `${phase.estimatedMinutes}m`
    : null;
  const taskCount = phase.tasks?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-start gap-2.5 rounded-lg border p-2 text-left transition-all ${
        isActive
          ? "border-white/20 bg-white/[0.07] text-white shadow-xs"
          : "border-transparent bg-transparent text-neutral-400 hover:bg-white/[0.03] hover:border-white/10 hover:text-neutral-200"
      }`}
    >
      {/* Phase number / check icon */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[0.6rem] font-bold ${
              isActive
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/[0.03] text-neutral-400 group-hover:border-white/30 group-hover:text-white"
            }`}
          >
            {index + 1}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span
          className={`block text-[0.8125rem] leading-snug ${
            isActive
              ? "font-semibold text-white"
              : isCompleted
              ? "text-neutral-500 line-through decoration-neutral-700"
              : "text-neutral-300 group-hover:text-white"
          }`}
        >
          {phase.title}
        </span>

        {(estTime || taskCount > 0) && (
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[0.625rem] text-neutral-500 group-hover:text-neutral-400">
            {estTime && <span>{estTime}</span>}
            {estTime && taskCount > 0 && <span>•</span>}
            {taskCount > 0 && (
              <span className={completedTasksCount > 0 ? "text-emerald-400 font-medium" : ""}>
                {completedTasksCount > 0 ? `${completedTasksCount}/${taskCount} tasks` : `${taskCount} tasks`}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function WorkspaceDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    (focusable()[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items[items.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault();
        items[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseRef.current(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-dialog-title"
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#0A0A0E] p-4 shadow-2xl sm:p-6 text-neutral-100"
      >
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label="Close dialog"
          className="absolute right-3.5 top-3.5 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="workspace-dialog-title" className="pr-8 font-serif text-base font-semibold text-white">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface PhaseViewerProps {
  project: Project;
  initialPhaseId?: string;
  progress: ProgressController;
}

export function PhaseViewer({ project, initialPhaseId, progress }: PhaseViewerProps) {
  const getInitialIdx = () => {
    if (!initialPhaseId) return 0;
    const idx = project.phases.findIndex(
      (p) => p.id === initialPhaseId || String(p.orderIndex) === initialPhaseId
    );
    return idx !== -1 ? idx : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIdx);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState<CurriculumIssueCategory>("unclear");
  const [issueMessage, setIssueMessage] = useState("");
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueFeedback, setIssueFeedback] = useState("");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const savedPhaseRestored = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const {
    enrolled,
    currentPhaseIndex,
    completed,
    completedTasks,
    isVerified,
    certificateId,
    githubRepoUrl,
    liveDemoUrl,
    hydrated,
    togglePhase,
    toggleTask,
    isTaskCompleted,
    setVerificationSuccess,
    isCompleted,
    clearProgress,
    setActivePhase,
  } = progress;

  const activePhase = project.phases[activeIndex];
  const totalPhases = project.phases.length;
  const completedCount = completed.length;
  const progressPct = totalPhases > 0 ? (completedCount / totalPhases) * 100 : 0;
  const allDone = completedCount === totalPhases;

  useEffect(() => {
    if (initialPhaseId) {
      const idx = project.phases.findIndex(
        (p) => p.id === initialPhaseId || String(p.orderIndex) === initialPhaseId
      );
      // The URL phase is external navigation state and must update the selected phase.
      if (idx !== -1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveIndex(idx);
        if (hydrated && enrolled) {
          setActivePhase(project.phases[idx].id, idx);
        }
      }
    }
  }, [initialPhaseId, project.phases, hydrated, enrolled, setActivePhase]);

  useEffect(() => {
    if (!hydrated || initialPhaseId) return;
    if (!enrolled) { savedPhaseRestored.current = false; return; }
    if (savedPhaseRestored.current) return;
    // Restore the server-saved active phase after progress hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentPhaseIndex >= 0 && currentPhaseIndex < project.phases.length) setActiveIndex(currentPhaseIndex);
    savedPhaseRestored.current = true;
  }, [hydrated, enrolled, currentPhaseIndex, initialPhaseId, project.phases.length]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeIndex]);

  useEffect(() => {
    if (!notesOpen || !user || !enrolled || !activePhase) return;
    let cancelled = false;
    // Entering a phase starts an asynchronous note request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteLoading(true);
    setNoteMessage("");
    api.getPhaseNote(project.slug, activePhase.id)
      .then((result) => {
        if (!cancelled) {
          setNote(result.content);
          setSavedNote(result.content);
        }
      })
      .catch((error) => { if (!cancelled) setNoteMessage(error instanceof Error ? error.message : "Could not load note"); })
      .finally(() => { if (!cancelled) setNoteLoading(false); });
    return () => { cancelled = true; };
  }, [notesOpen, user, enrolled, activePhase, project.slug]);

  const goTo = (i: number) => {
    if (i >= 0 && i < totalPhases) {
      setActiveIndex(i);
      setMobileDrawerOpen(false);
      setNotesOpen(false);
      setIssueOpen(false);
      if (hydrated && enrolled) setActivePhase(project.phases[i].id, i);
      setNoteMessage("");
      setIssueFeedback("");
    }
  };

  const handleToggleActivePhase = async () => {
    if (!activePhase) return;
    const activePhaseTaskIds = activePhase.tasks?.map((item) => item.id) ?? [];
    await togglePhase(activePhase.id, activePhaseTaskIds);
    // Do not auto-switch phase on completion: user remains on the current phase
  };

  const saveNote = async () => {
    if (!activePhase) return;
    setNoteSaving(true);
    setNoteMessage("");
    try {
      await api.savePhaseNote(project.slug, activePhase.id, note);
      setSavedNote(note);
      setNoteMessage("Note saved.");
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "Could not save note");
    } finally { setNoteSaving(false); }
  };

  const clearNote = async () => {
    if (!note && !savedNote) return;
    if (!window.confirm("Are you sure you want to delete your note for this phase?")) return;
    if (!activePhase) return;
    setNoteSaving(true);
    setNoteMessage("");
    try {
      await api.savePhaseNote(project.slug, activePhase.id, "");
      setNote("");
      setSavedNote("");
      setNoteMessage("Note deleted.");
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "Could not delete note");
    } finally { setNoteSaving(false); }
  };

  const handleCloseNotes = () => {
    if (note !== savedNote) {
      if (!window.confirm("You have unsaved changes in your note. Discard them?")) return;
    }
    setNotesOpen(false);
  };

  const submitIssue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activePhase) return;
    setIssueSaving(true);
    setIssueFeedback("");
    try {
      await api.reportPhaseIssue(project.slug, activePhase.id, { category: issueCategory, message: issueMessage });
      setIssueMessage("");
      setIssueFeedback("Thanks. Your report was sent to the curriculum team.");
    } catch (error) {
      setIssueFeedback(error instanceof Error ? error.message : "Could not submit report");
    } finally { setIssueSaving(false); }
  };

  return (
    <div className="flex h-[calc(100dvh-2.75rem)] overflow-hidden bg-[#050507]">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#0A0A0E] md:flex">
        {/* Progress & Track Header */}
        <div className="shrink-0 border-b border-white/[0.08] p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
              {project.track}
            </span>
            <span className="font-mono text-xs text-neutral-400">
              {hydrated ? completedCount : 0}/{totalPhases}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: hydrated ? `${progressPct}%` : "0%" }}
            />
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
              completedTasksCount={completedTasks[phase.id]?.length ?? 0}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>

        {/* Reset progress */}
        {hydrated && completedCount > 0 && (
          <div className="shrink-0 border-t border-white/[0.08] p-3 px-4">
            <button
              onClick={async () => {
                if (!window.confirm("Are you sure you want to reset your completed phase checkboxes for this project?")) return;
                if (await clearProgress()) goTo(0);
              }}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset phase checkboxes
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#050507]">
        {/* Phase header bar */}
        <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0A0A0E] px-3 py-2 sm:px-4 md:flex-nowrap md:gap-4 md:px-6 md:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            {/* Mobile drawer trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex md:hidden shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-200 hover:border-white/20 hover:text-white"
              aria-label="Open phase navigation drawer"
            >
              <Layers className="h-3.5 w-3.5 text-neutral-300" />
              <span>Phases ({activeIndex + 1}/{totalPhases})</span>
            </button>

            <span className="hidden whitespace-nowrap font-mono text-[0.7rem] text-neutral-400 md:inline">
              Phase {activeIndex + 1}/{totalPhases}
            </span>
            <h1 className="truncate font-serif text-[0.9375rem] font-semibold text-white">
              {activePhase.title}
            </h1>
          </div>

          {/* Differentiated Right Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {enrolled && hydrated && (
              <>
                {/* Notes Button */}
                <button
                  type="button"
                  onClick={() => { setNotesOpen((open) => !open); setIssueOpen(false); setAssistantOpen(false); }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
                  aria-haspopup="dialog"
                  aria-expanded={notesOpen}
                >
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Notes</span>
                </button>

                {/* Report Issue Button: Ghost Outline */}
                <button
                  type="button"
                  onClick={() => { setIssueOpen((open) => !open); setNotesOpen(false); setAssistantOpen(false); }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-xs text-neutral-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-neutral-200 transition-all cursor-pointer"
                  aria-haspopup="dialog"
                  aria-expanded={issueOpen}
                >
                  <Flag className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Report</span>
                </button>

                {/* Community Discussions Link */}
                <Link
                  href={`/discussions?projectSlug=${encodeURIComponent(project.slug)}`}
                  target="_blank"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-xs text-neutral-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-neutral-200 transition-all cursor-pointer"
                  title="View community discussions for this project"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Discuss</span>
                </Link>

                {/* AI Assistant Button */}
                <button
                  type="button"
                  onClick={() => { setAssistantOpen(true); setNotesOpen(false); setIssueOpen(false); }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.14] transition-all shadow-[0_0_15px_rgba(255,255,255,0.06)] cursor-pointer"
                  aria-haspopup="dialog"
                  aria-expanded={assistantOpen}
                >
                  <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                  <span>AI Assistant</span>
                </button>
              </>
            )}

            {/* Mark Complete CTA Button */}
            {hydrated && (
              <button
                onClick={() => void handleToggleActivePhase()}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isCompleted(activePhase.id)
                    ? "border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/30"
                    : "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.12)] active:scale-95"
                }`}
              >
                {isCompleted(activePhase.id) ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            )}

            {/* Verify Build / Certificate Header Button when all phases completed */}
            {enrolled && hydrated && allDone && (
              <button
                type="button"
                onClick={() => setVerificationModalOpen(true)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isVerified
                    ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50"
                    : "border border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.15] shadow-xs"
                }`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${isVerified ? "text-emerald-400" : "text-white"}`} />
                <span>{isVerified ? "Verified Proof" : "Verify Build"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Markdown content container with ref for scroll-to-top */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          {/* Centered content wrapper with Right-Side Tasks Rail */}
          <div className="mx-auto max-w-7xl flex gap-8 items-start">
            {/* Main content column */}
            <div className="flex-1 min-w-0">
              {allDone && hydrated && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-emerald-500/30 bg-[#0A0A0E] p-4 sm:p-5 shadow-lg">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-400 mt-0.5">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-emerald-300">
                          All Phases Completed!
                        </h4>
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Proof of Work
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                        {isVerified
                          ? `Your repository has been verified against the production project architecture. Certificate ID: ${certificateId}`
                          : "Submit your public GitHub repository to run automated project fingerprint checks and claim your shareable Proof of Work certificate."}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isVerified && certificateId ? (
                      <Link
                        href={`/verify/${certificateId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-500/30"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>View Certificate</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVerificationModalOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-black transition-all hover:bg-neutral-200 shadow-sm active:scale-95"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify & Claim Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Phase summary callout — "What we will achieve" */}
              {activePhase.summary && (
                <div className="mb-7 rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-5 sm:p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-widest text-neutral-300">
                      Phase Focus & What You Will Achieve
                    </p>
                    {activePhase.estimatedMinutes && (
                      <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {activePhase.estimatedMinutes >= 60
                          ? `${Math.round(activePhase.estimatedMinutes / 60)}h estimated`
                          : `${activePhase.estimatedMinutes}m estimated`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-200">
                    {activePhase.summary}
                  </p>
                </div>
              )}

              {/* Mobile/Tablet Compact Milestones Bar (Only shown on screens < xl) */}
              {activePhase.tasks && activePhase.tasks.length > 0 && (() => {
                const phaseTasks = activePhase.tasks;
                const activePhaseTaskIds = phaseTasks.map((t) => t.id);
                const completedCountForPhase = phaseTasks.filter((t) =>
                  isTaskCompleted(activePhase.id, t.id)
                ).length;
                const allPhaseTasksDone = completedCountForPhase === phaseTasks.length;

                return (
                  <div className="xl:hidden mb-6 rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-white" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                          Phase Milestones
                        </span>
                        {allPhaseTasksDone && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-neutral-400">
                        {completedCountForPhase}/{phaseTasks.length} done
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${(completedCountForPhase / phaseTasks.length) * 100}%` }}
                      />
                    </div>

                    <div className="mt-3.5 space-y-2">
                      {phaseTasks.map((task) => {
                        const done = isTaskCompleted(activePhase.id, task.id);
                        return (
                          <button
                            key={task.id}
                            type="button"
                            disabled={!enrolled}
                            onClick={() => void toggleTask(activePhase.id, task.id, activePhaseTaskIds)}
                            className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg border p-2 text-left transition-all ${
                              done
                                ? "border-emerald-500/20 bg-emerald-950/10 text-neutral-400"
                                : "border-white/[0.06] bg-[#050507] text-neutral-200 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                                  done
                                    ? "border-emerald-500 bg-emerald-500 text-black shadow-xs"
                                    : "border-white/25 bg-white/[0.03] text-transparent"
                                }`}
                              >
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            </div>
                            <span
                              className={`text-xs leading-snug ${
                                done
                                  ? "line-through decoration-neutral-700 text-neutral-500"
                                  : "text-neutral-200"
                              }`}
                            >
                              {task.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <MarkdownContent>{activePhase.content}</MarkdownContent>
            </div>

            {/* Right-Side Tasks Quick Navigation Rail (Sticky on desktop, compact & small) */}
            {activePhase.tasks && activePhase.tasks.length > 0 && (() => {
              const phaseTasks = activePhase.tasks;
              const activePhaseTaskIds = phaseTasks.map((t) => t.id);
              const completedCountForPhase = phaseTasks.filter((t) =>
                isTaskCompleted(activePhase.id, t.id)
              ).length;

              return (
                <aside className="hidden xl:block w-64 shrink-0 sticky top-4">
                  <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-3.5 shadow-md">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-white" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                          Phase Tasks
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-[#07070A] border border-white/10 font-medium">
                        {completedCountForPhase}/{phaseTasks.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">
                      Milestones for this phase:
                    </p>
                    <nav className="space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                      {phaseTasks.map((task, ti) => {
                        const done = isTaskCompleted(activePhase.id, task.id);
                        return (
                          <div
                            key={task.id}
                            className="group/item flex items-start gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/[0.04]"
                          >
                            <button
                              type="button"
                              disabled={!enrolled}
                              onClick={(e) => {
                                e.stopPropagation();
                                void toggleTask(activePhase.id, task.id, activePhaseTaskIds);
                              }}
                              className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-all ${
                                done
                                  ? "border-emerald-500 bg-emerald-500 text-black shadow-xs"
                                  : "border-white/20 bg-white/[0.04] text-transparent hover:border-white/40"
                              } ${!enrolled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                              title={done ? "Mark incomplete" : "Mark complete"}
                            >
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void toggleTask(activePhase.id, task.id, activePhaseTaskIds);
                              }}
                              className="w-full text-left flex items-start gap-2 text-neutral-400 hover:text-white group/name cursor-pointer min-w-0"
                            >
                              <span className="shrink-0 font-mono text-[10px] font-bold text-neutral-500 group-hover/name:text-neutral-300">
                                {String(ti + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={`text-xs line-clamp-2 leading-snug transition-colors ${
                                  done
                                    ? "text-neutral-500 line-through decoration-neutral-700"
                                    : "text-neutral-300 group-hover/name:text-white"
                                }`}
                              >
                                {task.title}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </nav>
                  </div>
                </aside>
              );
            })()}
          </div>

            {notesOpen && enrolled && (
              <WorkspaceDialog title="My notes for this phase" onClose={handleCloseNotes}>
                <p className="mb-3 mt-1 text-xs text-neutral-400">Private to your account. Notes stay saved if you reset phase checkboxes.</p>
                {noteLoading ? (
                  <p className="text-xs text-neutral-400">Loading note…</p>
                ) : (
                  <textarea
                    aria-label="Private phase notes"
                    maxLength={10000}
                    rows={6}
                    value={note}
                    onChange={(event) => { setNote(event.target.value); setNoteMessage(""); }}
                    className="w-full rounded-lg border border-white/10 bg-[#050507] p-3 text-sm text-neutral-200 outline-none focus:border-white/30"
                    placeholder="Save key ideas, links, or questions for this phase…"
                  />
                )}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p aria-live="polite" className="text-xs text-neutral-400">
                      {noteMessage || `${note.length}/10,000 characters`}
                    </p>
                    {note !== savedNote && (
                      <span className="text-[10px] font-medium text-amber-400">● Unsaved draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(note || savedNote) && (
                      <button
                        type="button"
                        onClick={() => void clearNote()}
                        disabled={noteSaving || noteLoading}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-950/30 disabled:opacity-30 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear note
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void saveNote()}
                      disabled={noteSaving || noteLoading || note === savedNote}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {noteSaving ? "Saving…" : "Save note"}
                    </button>
                  </div>
                </div>
              </WorkspaceDialog>
            )}

            {issueOpen && enrolled && (
              <WorkspaceDialog title="Report a curriculum issue" onClose={() => setIssueOpen(false)}>
                <form onSubmit={(event) => void submitIssue(event)}>
                  <p className="mb-3 mt-1 text-xs text-neutral-400">Tell the team what needs fixing in this phase.</p>
                  <div className="grid items-start gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <select
                      aria-label="Issue category"
                      value={issueCategory}
                      onChange={(event) => setIssueCategory(event.target.value as CurriculumIssueCategory)}
                      className="h-10 w-full self-start rounded-lg border border-white/10 bg-[#050507] p-2 text-xs text-neutral-200 outline-none focus:border-white/30"
                    >
                      <option value="unclear">Unclear instructions</option>
                      <option value="broken">Broken link or code</option>
                      <option value="outdated">Outdated information</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea
                      aria-label="Describe the curriculum issue"
                      required
                      minLength={1}
                      maxLength={2000}
                      rows={4}
                      value={issueMessage}
                      onChange={(event) => setIssueMessage(event.target.value)}
                      className="min-w-0 w-full rounded-lg border border-white/10 bg-[#050507] p-3 text-sm text-neutral-200 outline-none focus:border-white/30"
                      placeholder="Describe the problem (up to 2,000 characters)…"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p aria-live="polite" className="text-xs text-neutral-400">{issueFeedback}</p>
                    <button
                      type="submit"
                      disabled={issueSaving || !issueMessage.trim()}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
                    >
                      {issueSaving ? "Sending…" : "Send report"}
                    </button>
                  </div>
                </form>
              </WorkspaceDialog>
            )}
        </div>

        {/* Navigation footer */}
        <div className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#0A0A0E] px-3 sm:px-4 md:px-6">
          <button
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs ${
              activeIndex === 0
                ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] text-neutral-600 opacity-40"
                : "cursor-pointer border-white/20 bg-white/[0.08] text-white hover:bg-white hover:text-black hover:border-white active:scale-95"
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Prev</span>
          </button>

          {/* Dot indicators */}
          <div className="flex max-w-[45vw] items-center gap-1.5 overflow-x-auto px-1">
            {project.phases.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => goTo(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === activeIndex
                    ? "w-4 bg-white"
                    : hydrated && isCompleted(phase.id)
                    ? "w-1.5 bg-emerald-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to phase ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === totalPhases - 1}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs ${
              activeIndex === totalPhases - 1
                ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] text-neutral-600 opacity-40"
                : "cursor-pointer border-white/20 bg-white/[0.08] text-white hover:bg-white hover:text-black hover:border-white active:scale-95"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {assistantOpen && activePhase && (
        <AssistantDrawer
          key={activePhase.id}
          project={project}
          phase={activePhase}
          onClose={() => setAssistantOpen(false)}
        />
      )}

      {/* Mobile Phases Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Project phases navigation">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Slide-out drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col border-r border-white/[0.08] bg-[#0A0A0E] shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
              <div className="min-w-0 pr-2">
                <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                  {project.track}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close phases menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar in drawer */}
            <div className="border-b border-white/[0.08] px-4 py-3">
              <div className="mb-1.5 flex justify-between text-[0.7rem] text-neutral-400">
                <span>Progress</span>
                <span className="font-mono text-white">
                  {hydrated ? completedCount : 0}/{totalPhases}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: hydrated ? `${progressPct}%` : "0%" }}
                />
              </div>
            </div>

            {/* Phase list in drawer */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {project.phases.map((phase, i) => (
                <PhaseSidebarItem
                  key={phase.id}
                  phase={phase}
                  index={i}
                  isActive={i === activeIndex}
                  isCompleted={hydrated && isCompleted(phase.id)}
                  completedTasksCount={completedTasks[phase.id]?.length ?? 0}
                  onClick={() => {
                    goTo(i);
                    setMobileDrawerOpen(false);
                  }}
                />
              ))}
            </nav>

            {/* Reset progress button if applicable */}
            {hydrated && completedCount > 0 && (
              <div className="shrink-0 border-t border-white/[0.08] p-3 px-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to reset your completed phase checkboxes for this project?")) return;
                    if (await clearProgress()) {
                      goTo(0);
                      setMobileDrawerOpen(false);
                    }
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-neutral-400 transition-colors hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset phase checkboxes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification & Proof of Work Modal */}
      <ProjectVerificationModal
        project={project}
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        existingCertificateId={certificateId}
        existingGithubUrl={githubRepoUrl}
        existingLiveUrl={liveDemoUrl}
        onVerified={(data) => {
          setVerificationSuccess(data);
        }}
      />
    </div>
  );
}
