"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/projects";

interface WorkspaceEnrollmentGuardProps {
  project: Project;
  children: React.ReactNode;
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
  // Shares the same single API call as any other useProgress consumer on this page.
  const { enrolled, hydrated } = useProgress(project.slug);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setDeniedReason("Authentication required. Please sign in and enroll to access this workspace.");
      const timer = setTimeout(() => {
        router.replace(`/projects/${project.slug}?access=login_required`);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (!hydrated) return;

    if (!enrolled) {
      setDeniedReason("Enrollment required. You must enroll in this project to access the workspace.");
      const timer = setTimeout(() => {
        router.replace(`/projects/${project.slug}?access=enrollment_required`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, enrolled, hydrated, project.slug, router]);

  if (authLoading || (user && !hydrated)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0a] text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-3" />
        <p className="text-xs text-stone-400">Verifying project enrollment status...</p>
      </div>
    );
  }

  if (!user || !enrolled) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center">
        <div className="max-w-md rounded-xl border border-amber-900/50 bg-[#12100d] p-6 shadow-2xl">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-[#f0eae1] mb-2">
            {!user ? "Sign In Required" : "Enrollment Required"}
          </h2>
          <p className="text-xs text-[#9a9187] leading-relaxed mb-5">
            {deniedReason ?? "You must enroll in this project to access the interactive step-by-step workspace."}
          </p>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go to Project Overview &amp; Enroll
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
