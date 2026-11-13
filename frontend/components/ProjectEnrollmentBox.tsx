"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import {
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import { useAuth } from "@/context/AuthContext";
import type { ProgressController } from "@/hooks/useProgress";
import { api } from "@/lib/api";

interface ProjectEnrollmentBoxProps {
  project: Project;
  progress: ProgressController;
}

export function ProjectEnrollmentBox({ project, progress }: ProjectEnrollmentBoxProps) {
  const { user, login } = useAuth();
  const { enrolled: isEnrolled, completed, hydrated, loadError, refreshProgress } = progress;

  const [localEnrolledOwner, setLocalEnrolledOwner] = useState<string | null>(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const localEnrolled = Boolean(user && localEnrolledOwner === user.id);
  const effectivelyEnrolled = isEnrolled || localEnrolled;

  const handleEnroll = async () => {
    if (!user) return;
    setLoadingEnrollment(true);
    setActionError(null);
    try {
      await api.enrollProject(project.slug);
      setLocalEnrolledOwner(user.id);
      await refreshProgress();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not enroll right now. Please try again.");
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const totalPhases = project.phases.length;
  const completedCount = completed.length;
  const progressPercent =
    totalPhases > 0 ? Math.round((completedCount / totalPhases) * 100) : 0;
  const hasStarted = completedCount > 0;

  return (
    <div
      id="enrollment-box"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
    >
      {/* Ambient gradient top glow */}
      <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-44 -translate-x-1/2 rounded-full bg-white/[0.04] blur-xl" />

      {/* Header */}
      <div className="mb-4">
        <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-neutral-400">
          BUILD TRACKER
        </span>
        <h3 className="font-sans text-lg font-bold text-white mt-0.5">
          {effectivelyEnrolled ? "Your Blueprint Progress" : "Start This Blueprint"}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          {effectivelyEnrolled
            ? "Complete milestones and check off checkpoints in the step-by-step workspace."
            : "Enroll to save your checkpoints, take notes, and launch the interactive phase workspace."}
        </p>
      </div>

      {/* Load error recovery banner */}
      {loadError && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
          <p className="font-medium">Could not sync progress</p>
          <p className="text-[11px] text-rose-400/80 mt-0.5">{loadError}</p>
          <button
            type="button"
            onClick={() => void refreshProgress()}
            className="mt-2 inline-flex items-center gap-1 rounded bg-rose-900/40 px-2 py-0.5 text-[11px] font-medium text-rose-200 hover:bg-rose-900/60 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Enrollment Action / Progress Display */}
      {!hydrated ? (
        <div className="flex items-center justify-center py-6 text-neutral-400 gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span className="text-xs font-mono">Syncing blueprint state...</span>
        </div>
      ) : !user ? (
        /* Sign-in prompt */
        <div className="space-y-3 pt-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-xs text-neutral-300">
            <div className="flex items-center gap-2 mb-1 text-white font-semibold">
              <Sparkles className="h-4 w-4 text-white" />
              <span>100% Free & Open Access</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Sign in with Google in one click to unlock the workspace, track completed phases, and save private notes.
            </p>
          </div>
          <div className="w-full flex justify-center py-1">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  void login(credentialResponse.credential);
                }
              }}
              onError={() => {
                setActionError("Google sign-in was interrupted. Please try again.");
              }}
              size="large"
              shape="rectangular"
              theme="filled_black"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>
      ) : effectivelyEnrolled ? (
        /* Already Enrolled: Show Progress & Launch Button */
        <div className="space-y-4 pt-1">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-neutral-400">Completion</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#060608] border border-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 font-mono">
              <span>{completedCount} of {totalPhases} phases</span>
              <span>{totalPhases - completedCount} remaining</span>
            </div>
          </div>

          {/* Launch Workspace Button */}
          <Link
            href={`/projects/${project.slug}/workspace`}
            className="btn-primary w-full py-3! text-xs! font-bold!"
          >
            <PlayCircle className="h-4 w-4" />
            <span>{hasStarted ? "Continue Workspace" : "Launch Phase 1 Workspace"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Authenticated but not yet enrolled */
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => void handleEnroll()}
            disabled={loadingEnrollment}
            className="btn-primary w-full py-3! text-xs! font-bold! cursor-pointer disabled:opacity-50"
          >
            {loadingEnrollment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Enrolling in Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Enroll &amp; Start Building</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {actionError && (
        <p className="mt-2 text-center text-xs text-rose-400">{actionError}</p>
      )}

      {/* Blueprint Info Specs */}
      <div className="mt-5 border-t border-white/[0.08] pt-4 space-y-2.5 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="h-3.5 w-3.5 text-white" />
            Estimated Build Time
          </span>
          <span className="font-mono text-neutral-200 font-medium">{project.estimatedHours} hours</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Layers className="h-3.5 w-3.5 text-white" />
            Curriculum Structure
          </span>
          <span className="font-mono text-neutral-200 font-medium">{totalPhases} Phases</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Prerequisites
          </span>
          <span className="font-mono text-neutral-200 font-medium">{project.difficulty} Level</span>
        </div>
      </div>
    </div>
  );
}
