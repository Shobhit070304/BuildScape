"use client";

import { useState, useEffect } from "react";
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
  const { completed } = useProgress(project.slug);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check enrollment status when user changes
  useEffect(() => {
    if (!user) {
      setIsEnrolled(false);
      setCheckingStatus(false);
      return;
    }

    setCheckingStatus(true);
    api
      .getProgress(project.slug)
      .then((data) => {
        setIsEnrolled(data.enrolled);
      })
      .catch(() => {
        setIsEnrolled(false);
      })
      .finally(() => {
        setCheckingStatus(false);
      });
  }, [user, project.slug]);

  const handleEnroll = async () => {
    if (!user) return;
    setLoadingEnrollment(true);
    try {
      await api.enrollProject(project.slug);
      setIsEnrolled(true);
    } catch (err) {
      console.error("Failed to enroll:", err);
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
    <div id="enrollment-box" className="rounded-xl border border-[#26221c] bg-[#11100e] p-5 shadow-xl shadow-black/40">
      {/* Box Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#221f1a] pb-3.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9e9587]">
          Project Access
        </span>
        {isEnrolled ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Enrolled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/30 bg-amber-950/30 px-2.5 py-0.5 text-[0.7rem] font-medium text-[#c9a96e]">
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
      {isEnrolled ? (
        <div className="mb-6 rounded-lg border border-[#24211b] bg-[#161411] p-3.5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#8a8178]">Your Progress</span>
            <span className="font-semibold text-[#c9a96e]">
              {completedCount}/{totalPhases} completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#24211b]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-700 to-[#c9a96e] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-6 space-y-2 rounded-lg border border-[#24211b] bg-[#161411] p-3.5 text-xs text-[#8a8178]">
          <p className="font-medium text-[#c4bbb0]">Includes with enrollment:</p>
          <ul className="space-y-1 text-[0.75rem]">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Complete code walkthroughs & explanation
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Step-by-step phase checklists
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Cloud progress saved to your profile
            </li>
          </ul>
        </div>
      )}

      {/* Action CTA */}
      <div className="space-y-3">
        {checkingStatus ? (
          <div className="flex h-10 w-full items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#141414] text-xs text-[#8a8178]">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Loading status...
          </div>
        ) : isEnrolled ? (
          <Link
            href={`/projects/${project.slug}/workspace`}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600/50 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-4 py-2.5 text-sm font-semibold text-stone-950 shadow-md transition-all hover:opacity-95 hover:shadow-amber-900/20 active:scale-[0.99]"
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
                <Loader2 className="h-4 w-4 animate-spin text-[#c9a96e]" />
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#c9a96e]" />
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
                  if (res.credential) login(res.credential);
                }}
                onError={() => console.error("Google sign in failed")}
                shape="rectangular"
                theme="filled_black"
                text="signin_with"
                size="medium"
              />
            </div>
            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-[#221f1a]" />
              <span className="absolute bg-[#11100e] px-2 text-[0.65rem] text-[#5c5449]">
                OR
              </span>
            </div>
            <Link
              href={`/projects/${project.slug}/workspace`}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#262420] bg-transparent py-2 text-xs text-[#8a8178] transition-colors hover:border-[#3a352c] hover:text-[#e4ddd3]"
            >
              <span>Explore as Guest</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {isEnrolled && (
          <p className="text-center text-[0.7rem] text-[#6b6256]">
            Enrolled with {user?.email}. Progress syncs automatically.
          </p>
        )}
      </div>
    </div>
  );
}
