"use client";

import { useState, useEffect, useRef } from "react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Trophy,
  ShieldCheck,
  FileText,
  Flag,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import type { Project, Phase } from "@/lib/projects";
import type { ProgressController } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";
import { VerificationModal } from "./VerificationModal";
import { AssistantDrawer } from "./AssistantDrawer";
import { MarkdownContent } from "./MarkdownContent";
import { TechBadge } from "./TechBadge";
import { api, type CurriculumIssueCategory } from "@/lib/api";

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-xs"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseRef.current(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-dialog-title"
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#342f27] bg-[#11100e] p-4 shadow-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-md p-1 text-text-muted transition-colors hover:bg-[#24211b] hover:text-[#e4ddd3]"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="workspace-dialog-title" className="pr-8 font-serif text-base font-semibold text-[#e4ddd3]">{title}</h2>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState<CurriculumIssueCategory>("unclear");
  const [issueMessage, setIssueMessage] = useState("");
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueFeedback, setIssueFeedback] = useState("");
  const savedPhaseRestored = useRef(false);
  const { user } = useAuth();
  const {
    enrolled,
    currentPhaseIndex,
    completed,
    hydrated,
    togglePhase,
    isCompleted,
    clearProgress,
    isVerified,
    githubRepoUrl,
    liveDemoUrl,
    verifiedAt,
    refreshProgress,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [initialPhaseId, project.phases]);

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
    if (!notesOpen || !user || !enrolled || !activePhase) return;
    let cancelled = false;
    // Entering a phase starts an asynchronous note request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteLoading(true);
    setNoteMessage("");
    api.getPhaseNote(project.slug, activePhase.id)
      .then((result) => { if (!cancelled) setNote(result.content); })
      .catch((error) => { if (!cancelled) setNoteMessage(error instanceof Error ? error.message : "Could not load note"); })
      .finally(() => { if (!cancelled) setNoteLoading(false); });
    return () => { cancelled = true; };
  }, [notesOpen, user, enrolled, activePhase, project.slug]);

  const goTo = (i: number) => {
    if (i >= 0 && i < totalPhases) {
      setActiveIndex(i);
      setNotesOpen(false);
      setIssueOpen(false);
      if (hydrated && enrolled) setActivePhase(project.phases[i].id, i);
      setNoteMessage("");
      setIssueFeedback("");
    }
  };

  const handleToggleActivePhase = async () => {
    if (!activePhase) return;
    const wasCompleted = isCompleted(activePhase.id);
    if (!await togglePhase(activePhase.id)) return;
    if (!wasCompleted && activeIndex + 1 < totalPhases) {
      goTo(activeIndex + 1);
      return;
    }
    if (wasCompleted) {
      const firstIncomplete = project.phases.findIndex((phase) =>
        phase.id === activePhase.id ? true : !completed.includes(phase.id)
      );
      goTo(firstIncomplete >= 0 ? firstIncomplete : activeIndex);
    }
  };

  const saveNote = async () => {
    if (!activePhase) return;
    setNoteSaving(true);
    setNoteMessage("");
    try {
      await api.savePhaseNote(project.slug, activePhase.id, note);
      setNoteMessage("Note saved.");
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "Could not save note");
    } finally { setNoteSaving(false); }
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
    <div className="flex h-[calc(100dvh-2.75rem)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-[#1a1a1a] bg-[#0d0d0d] md:flex">
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
          <div className="mb-3 flex flex-wrap gap-1" aria-label="Project technologies">
            {project.techStack.map((technology) => (
              <TechBadge key={technology} name={technology} size="xs" />
            ))}
          </div>

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
              onClick={async () => { if (await clearProgress()) goTo(0); }}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-text-faint transition-colors hover:text-text-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset phase checkboxes
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Phase header bar */}
        <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#1a1a1a] bg-[#0e0e0e] px-3 py-2 sm:px-4 md:flex-nowrap md:gap-4 md:px-6 md:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            <span className="whitespace-nowrap font-mono text-[0.7rem] text-text-faint">
              Phase {activeIndex + 1}/{totalPhases}
            </span>
            <h1 className="truncate font-serif text-[0.9375rem] font-semibold text-[#e4ddd3]">
              {activePhase.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {enrolled && hydrated && (
              <>
                <button type="button" onClick={() => { setNotesOpen((open) => !open); setIssueOpen(false); setAssistantOpen(false); }} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#373128] px-2.5 py-1.5 text-xs text-text-muted hover:bg-[#1a1814]" aria-haspopup="dialog" aria-expanded={notesOpen}>
                  <FileText className="h-3.5 w-3.5" /> Notes
                </button>
                <button type="button" onClick={() => { setIssueOpen((open) => !open); setNotesOpen(false); setAssistantOpen(false); }} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#373128] px-2.5 py-1.5 text-xs text-text-muted hover:bg-[#1a1814]" aria-haspopup="dialog" aria-expanded={issueOpen}>
                  <Flag className="h-3.5 w-3.5" /> Report issue
                </button>
                <button type="button" onClick={() => { setAssistantOpen(true); setNotesOpen(false); setIssueOpen(false); }} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-800/50 bg-amber-950/25 px-2.5 py-1.5 text-xs text-amber-200 transition-colors hover:bg-amber-900/35" aria-haspopup="dialog" aria-expanded={assistantOpen}>
                  <Sparkles className="h-3.5 w-3.5" /> AI Help
                </button>
              </>
            )}
            {allDone && hydrated && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-all shadow-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isVerified ? "Public Repo Linked" : "Check Public Repo"}</span>
              </button>
            )}

            {hydrated && (
              <button
                onClick={() => void handleToggleActivePhase()}
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
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Centered content wrapper */}
          <div className="mx-auto max-w-208">
            {allDone && hydrated && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 rounded-xl border border-emerald-700/40 bg-linear-to-r from-emerald-950/30 to-[#0e1713] p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-700/40 bg-emerald-950/60 text-emerald-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-emerald-300">
                        All Phases Completed!
                      </h4>
                      {isVerified && (
                        <span className="rounded-full border border-emerald-700/50 bg-emerald-950/70 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Public repo checked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#a0978c] mt-0.5">
                      {isVerified
                        ? "Your public GitHub repository is listed on your developer profile. BuildScape checks that it is public, not who owns it or what it contains."
                        : "Link a public GitHub repository to your developer profile. BuildScape checks that the repository is public."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-600/50 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-stone-950 transition-all cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isVerified ? "View Profile & Links" : "Check Public Repository"}</span>
                </button>
              </div>
            )}

            <MarkdownContent>{activePhase.content}</MarkdownContent>

            {notesOpen && enrolled && (
              <WorkspaceDialog title="My notes for this phase" onClose={() => setNotesOpen(false)}>
                <p className="mb-3 mt-1 text-xs text-text-faint">Private to your account. Notes stay saved if you reset phase checkboxes.</p>
                {noteLoading ? <p className="text-xs text-text-muted">Loading note…</p> : <textarea aria-label="Private phase notes" maxLength={10000} rows={6} value={note} onChange={(event) => { setNote(event.target.value); setNoteMessage(""); }} className="w-full rounded-lg border border-[#342f27] bg-[#0d0c0a] p-3 text-sm text-[#e4ddd3] outline-none focus:border-amber-700" placeholder="Save key ideas, links, or questions for this phase…" />}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p aria-live="polite" className="text-xs text-text-muted">{noteMessage || `${note.length}/10,000 characters`}</p>
                  <button type="button" onClick={() => void saveNote()} disabled={noteSaving || noteLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"><Save className="h-3.5 w-3.5" />{noteSaving ? "Saving…" : "Save note"}</button>
                </div>
              </WorkspaceDialog>
            )}

            {issueOpen && enrolled && (
              <WorkspaceDialog title="Report a curriculum issue" onClose={() => setIssueOpen(false)}>
                <form onSubmit={(event) => void submitIssue(event)}>
                  <p className="mb-3 mt-1 text-xs text-text-faint">Tell the team what needs fixing in this phase.</p>
                  <div className="grid items-start gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <select aria-label="Issue category" value={issueCategory} onChange={(event) => setIssueCategory(event.target.value as CurriculumIssueCategory)} className="h-10 w-full self-start rounded-lg border border-[#342f27] bg-[#0d0c0a] p-2 text-xs text-[#e4ddd3]"><option value="unclear">Unclear instructions</option><option value="broken">Broken link or code</option><option value="outdated">Outdated information</option><option value="other">Other</option></select>
                    <textarea aria-label="Describe the curriculum issue" required minLength={1} maxLength={2000} rows={4} value={issueMessage} onChange={(event) => setIssueMessage(event.target.value)} className="min-w-0 w-full rounded-lg border border-[#342f27] bg-[#0d0c0a] p-3 text-sm text-[#e4ddd3] outline-none focus:border-amber-700" placeholder="Describe the problem (up to 2,000 characters)…" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-xs text-text-muted">{issueFeedback}</p><button type="submit" disabled={issueSaving || !issueMessage.trim()} className="rounded-lg border border-amber-800/50 bg-amber-950/25 px-3 py-2 text-xs font-semibold text-accent disabled:opacity-50">{issueSaving ? "Sending…" : "Send report"}</button></div>
                </form>
              </WorkspaceDialog>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-[#1a1a1a] bg-[#0e0e0e] px-3 sm:px-4 md:px-6">
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
          <div className="flex max-w-[45vw] items-center gap-1.5 overflow-x-auto px-1">
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

      {/* Public repository check modal */}
      <VerificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectSlug={project.slug}
        projectTitle={project.title}
        isVerified={isVerified}
        verifiedAt={verifiedAt}
        initialGithubUrl={githubRepoUrl}
        initialDemoUrl={liveDemoUrl}
        username={user?.username}
        onVerifiedSuccess={() => {
          refreshProgress();
        }}
      />
      {assistantOpen && activePhase && (
        <AssistantDrawer
          key={activePhase.id}
          project={project}
          phase={activePhase}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </div>
  );
}
