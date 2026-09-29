"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2, Lock, ArrowLeft, ShieldAlert } from "lucide-react";
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
 * 1. Checks if a user is authenticated. If not, redirects to overview page with login alert.
 * 2. Checks if the authenticated user has enrolled in this project.
 * 3. If not enrolled, redirects back to the project overview page to enroll first.
 */
export function WorkspaceEnrollmentGuard({
  project,
  children,
}: WorkspaceEnrollmentGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    // Check if user is logged in
    if (!user) {
      setDeniedReason("Authentication required. Please log in and enroll to access this workspace.");
      setChecking(false);
      // Automatically redirect to overview page after 1.5s
      const timer = setTimeout(() => {
        router.replace(`/projects/${project.slug}?access=login_required`);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Verify enrollment from MongoDB API
    api
      .getProgress(project.slug)
      .then((data) => {
        if (data.enrolled) {
          setIsEnrolled(true);
        } else {
          setDeniedReason("Enrollment required. You must enroll in this project to access the workspace.");
          setTimeout(() => {
            router.replace(`/projects/${project.slug}?access=enrollment_required`);
          }, 1500);
        }
      })
      .catch((err) => {
        console.warn("Could not verify enrollment from API:", err);
        // Fallback: check localStorage enrollment record
        const localEnrolled = localStorage.getItem(`enrolled_${project.slug}`);
        if (localEnrolled === "true") {
          setIsEnrolled(true);
        } else {
          setDeniedReason("Enrollment required. Please enroll from the overview page.");
          setTimeout(() => {
            router.replace(`/projects/${project.slug}?access=enrollment_required`);
          }, 1500);
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, [user, authLoading, project.slug, router]);

  if (authLoading || checking) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0a] text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-3" />
        <p className="text-xs text-stone-400">Verifying project enrollment status...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center">
        <div className="max-w-md rounded-xl border border-amber-900/50 bg-[#12100d] p-6 shadow-2xl">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-[#f0eae1] mb-2">
            Enrollment Required
          </h2>
          <p className="text-xs text-[#9a9187] leading-relaxed mb-5">
            {deniedReason || "You must enroll in this project to access the interactive step-by-step workspace."}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go to Project Overview & Enroll
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
