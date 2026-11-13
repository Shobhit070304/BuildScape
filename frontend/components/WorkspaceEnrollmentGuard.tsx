"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import type { ProgressController } from "@/hooks/useProgress";

interface WorkspaceEnrollmentGuardProps {
  project: Project;
  children: (progress: ProgressController) => React.ReactNode;
}

/**
 * WorkspaceEnrollmentGuard
 *
 * Prevents non-enrolled users from accessing the interactive workspace.
 * 1. Waits for auth to initialise.
 * 2. If not logged in, redirects to the overview page with a login alert.
 * 3. Waits for progress to hydrate from the backend.
 * 4. If not enrolled, redirects to the overview page with an enroll prompt.
 */
export function WorkspaceEnrollmentGuard({
  project,
  children,
}: WorkspaceEnrollmentGuardProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const progress = useProgress(project.slug);
  const { enrolled, hydrated, loadError, refreshProgress } = progress;
  const deniedReason = !user
    ? "Authentication required. Please sign in and enroll to access this workspace."
    : !enrolled
      ? "Enrollment required. You must enroll in this project to access the workspace."
      : null;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const timer = setTimeout(() => {
        router.replace(`/projects/${project.slug}?access=login_required`);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (!hydrated || loadError) return;

    if (!enrolled) {
      const timer = setTimeout(() => {
        router.replace(`/projects/${project.slug}?access=enrollment_required`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, enrolled, hydrated, loadError, project.slug, router]);

  if (authLoading || (user && !hydrated)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0F172A] text-slate-300">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs font-mono text-slate-400">Verifying blueprint enrollment state...</p>
      </div>
    );
  }

  if (user && loadError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0F172A] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-rose-900/50 bg-[#141D2E] p-6 shadow-2xl">
          <h2 className="mb-2 text-base font-bold text-[#F8FAFC]">Could not check enrollment</h2>
          <p role="alert" className="mb-5 text-xs leading-relaxed text-slate-400">{loadError}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => void refreshProgress()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 cursor-pointer"
            >
              Retry
            </button>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Project overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !enrolled) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0F172A] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-[#334155] bg-[#141D2E] p-7 shadow-2xl">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 shadow-md">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-[#F8FAFC] mb-2">
            {!user ? "Sign In Required" : "Enrollment Required"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {deniedReason ?? "You must enroll in this project to access the interactive step-by-step workspace."}
          </p>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go to Project Overview &amp; Enroll
          </Link>
        </div>
      </div>
    );
  }

  return <>{children(progress)}</>;
}
