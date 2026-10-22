"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Loader2,
  PlayCircle,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { api } from "@/lib/api";

interface ProjectEnrollmentBoxProps {
  project: Project;
}

export function ProjectEnrollmentBox({ project }: ProjectEnrollmentBoxProps) {
  const { user, login } = useAuth();
  // Enrollment and saved phase progress hydrate from the same progress request.
  const { enrolled: isEnrolled, currentPhaseIndex, completed, hydrated } = useProgress(project.slug);

  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Derive effective enrollment: useProgress hydrates from backend; localEnrolled handles
  // optimistic state right after the user clicks "Enroll" before the next re-hydration.
  const effectivelyEnrolled = isEnrolled || localEnrolled;

  const handleEnroll = async () => {
    if (!user) return;
    setLoadingEnrollment(true);
    setEnrollmentError(null);
    try {
      await api.enrollProject(project.slug);
      setLocalEnrolled(true);
    } catch (err) {
      console.error("Failed to enroll:", err);
      setEnrollmentError(err instanceof Error ? err.message : "Enrollment failed. Please try again.");
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const totalPhases = project.phases.length;
  const completedCount = completed.length;
  const progressPercent =
    totalPhases > 0 ? Math.round((completedCount / totalPhases) * 100) : 0;
  const resumePhaseIndex = Math.max(0, Math.min(totalPhases - 1, currentPhaseIndex));
  const resumePhaseId = project.phases[resumePhaseIndex]?.id;
  const hasStarted = completedCount > 0 || resumePhaseIndex > 0;
  const workspaceHref = `/projects/${project.slug}/workspace${resumePhaseId ? `?phase=${encodeURIComponent(resumePhaseId)}` : ""}`;

  // Show a loading skeleton until useProgress has hydrated.
  if (!hydrated) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#0e0e0e] p-4 sm:p-5 shadow-xl">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div id="enrollment-box" className="rounded-xl border border-zinc-800 bg-[#0e0e0e] p-4 sm:p-5 shadow-xl">
      {/* Box Header */}
      <div className="mb-3.5 flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Project Access
        </span>
        {effectivelyEnrolled ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Enrolled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/30 bg-amber-950/30 px-2.5 py-0.5 text-[0.7rem] font-medium text-accent">
            <Sparkles className="h-3 w-3" />
            Free Curriculum
          </span>
        )}
      </div>

      {/* Project Quick Specs */}
      <div className="mb-6 space-y-2.5 text-xs text-[#a39a8c]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#6b6256]" />
            Curriculum
          </span>
          <span className="font-medium text-[#e4ddd3]">
            {totalPhases} Structured Phases
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#6b6256]" />
            Time to Complete
          </span>
          <span className="font-medium text-[#e4ddd3]">
            ~{project.estimatedHours} Hours
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#6b6256]" />
            Difficulty Level
          </span>
          <span className="font-medium text-[#e4ddd3]">{project.difficulty}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-[#6b6256]" />
            Deliverable
          </span>
          <span className="font-medium text-[#e4ddd3]">Production Deployment</span>
        </div>
      </div>

      {/* Progress or Enrollment Status */}
      {effectivelyEnrolled ? (
        <div className="mb-6 rounded-lg border border-[#24211b] bg-[#161411] p-3.5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#8a8178]">Your Progress</span>
            <span className="font-semibold text-accent">
              {completedCount}/{totalPhases} completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#24211b]">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-700 to-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-6 space-y-2 rounded-lg border border-[#24211b] bg-[#161411] p-3.5 text-xs text-[#8a8178]">
          <p className="font-medium text-[#c4bbb0]">Includes with enrollment:</p>
          <ul className="space-y-1 text-[0.75rem]">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Complete code walkthroughs &amp; explanation
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Phase-by-phase build guidance
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Cloud progress saved to your profile
            </li>
          </ul>
        </div>
      )}

      {/* Action CTA */}
      <div className="space-y-3">
        {enrollmentError && <p role="alert" className="rounded-md border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">{enrollmentError}</p>}
        {effectivelyEnrolled ? (
          <Link
            href={workspaceHref}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600/50 bg-linear-to-r from-amber-700 via-amber-600 to-amber-700 px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-md transition-all hover:opacity-95 hover:shadow-amber-900/20 active:scale-[0.99]"
          >
            <PlayCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{hasStarted ? "Continue Project" : "Start this Project"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : user ? (
          <button
            onClick={handleEnroll}
            disabled={loadingEnrollment}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-700/60 bg-amber-950/60 px-4 py-2.5 text-sm font-semibold text-[#e4ddd3] transition-all hover:bg-amber-900/60 hover:text-white active:scale-[0.99] disabled:opacity-50"
          >
            {loadingEnrollment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Enroll in Project</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2.5">
            <p className="text-center text-[0.72rem] text-[#8a8178]">
              Sign in with Google to enroll and save your progress:
            </p>
            <div className="flex justify-center scale-95 origin-center">
              <GoogleLogin
                onSuccess={(res) => {
                  setLoginError(null);
                  if (res.credential) login(res.credential).catch((err) => setLoginError(err instanceof Error ? err.message : "Sign-in failed. Please try again."));
                }}
                onError={() => setLoginError("Google sign-in failed. Please try again.")}
                shape="rectangular"
                theme="filled_black"
                text="signin_with"
                size="medium"
              />
            </div>
            {loginError && <p role="alert" className="text-center text-xs text-rose-300">{loginError}</p>}
          </div>
        )}

        {effectivelyEnrolled && (
          <p className="text-center text-[0.7rem] text-[#6b6256]">
            Enrolled with {user?.email}. Progress syncs automatically.
          </p>
        )}
      </div>

      <p className="mt-4 border-t border-zinc-800/80 pt-3 text-center text-[11px] text-[#8a8178]">
        {project.enrolledUsersCount.toLocaleString("en-US")} enrolled {project.enrolledUsersCount === 1 ? "builder" : "builders"}
      </p>
    </div>
  );
}
