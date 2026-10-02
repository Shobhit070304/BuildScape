"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import {
  LogOut,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2,
  FolderOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api, EnrolledProjectItem } from "@/lib/api";
import { DIFFICULTY_COLORS, getTrackColor } from "@/lib/projects";

export default function ProfilePage() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledProjectItem[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingEnrollments(true);
    api
      .getEnrolledProjects()
      .then((data) => {
        setEnrollments(data.enrollments ?? []);
      })
      .catch((err) => {
        console.error("Failed to load enrolled projects:", err);
      })
      .finally(() => {
        setLoadingEnrollments(false);
      });
  }, [user]);

  const totalCompletedPhases = enrollments.reduce(
    (sum, item) => sum + item.completedCount,
    0
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#0a0a0a] pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {authLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#c9a96e]" />
            </div>
          ) : !user ? (
            /* Not logged in state */
            <div className="mx-auto max-w-sm py-12 text-center">
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-800/40 bg-amber-950/30">
                <Layers className="h-6 w-6 text-[#c9a96e]" />
              </div>
              <h1 className="mb-1.5 font-serif text-xl font-bold text-[#e4ddd3]">
                Your BuildScape Profile
              </h1>
              <p className="mb-5 text-xs text-[#8a8178]">
                Sign in with Google to view your enrolled projects, track your learning progress, and earn completion certificates.
              </p>
              <div className="flex justify-center scale-95 origin-center">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) login(res.credential);
                  }}
                  onError={() => console.error("Google sign in failed")}
                  shape="pill"
                  theme="filled_black"
                  text="signin_with"
                  size="medium"
                />
              </div>
            </div>
          ) : (
            /* Logged in User Profile (Clean, compact, slightly smaller) */
            <div className="space-y-8">
              {/* Profile Header Card */}
              <div className="rounded-xl border border-[#221f1a] bg-gradient-to-b from-[#14120f] to-[#0e0d0b] p-4 sm:p-5 shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Avatar & User Details */}
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full border border-amber-700/40 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-700/40 bg-amber-950/60 font-serif text-lg font-bold text-[#c9a96e]">
                        {user.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="font-serif text-lg font-bold text-[#e4ddd3]">
                          {user.name}
                        </h1>
                        <span className="rounded-full border border-amber-800/40 bg-amber-950/40 px-2 py-0.2 text-[0.62rem] font-medium text-[#c9a96e]">
                          Learner
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a8178]">{user.email}</p>
                    </div>
                  </div>

                  {/* Clear Logout button */}
                  <div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 rounded border border-[#2a2620] bg-[#14120f] px-3 py-1.5 text-xs font-medium text-[#a0978c] transition-all hover:border-[#3a342c] hover:bg-[#1a1814] hover:text-[#e4ddd3] cursor-pointer"
                      title="Sign out of your account"
                    >
                      <LogOut className="h-3 w-3 text-[#7a7168]" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#1e1c18] pt-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#221f1a] bg-[#11100e] p-3">
                    <span className="text-[0.62rem] uppercase tracking-wider text-[#6b6256] font-mono">
                      Enrolled Projects
                    </span>
                    <p className="mt-0.5 font-mono text-lg font-bold text-[#e4ddd3]">
                      {enrollments.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#221f1a] bg-[#11100e] p-3">
                    <span className="text-[0.62rem] uppercase tracking-wider text-[#6b6256] font-mono">
                      Completed Phases
                    </span>
                    <p className="mt-0.5 font-mono text-lg font-bold text-[#c9a96e]">
                      {totalCompletedPhases}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-lg border border-[#221f1a] bg-[#11100e] p-3">
                    <span className="text-[0.62rem] uppercase tracking-wider text-[#6b6256] font-mono">
                      Learning Status
                    </span>
                    <p className="mt-0.5 font-mono text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Enrolled Projects Section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#e4ddd3]">
                      My Enrolled Projects
                    </h2>
                    <p className="text-[11px] text-[#7a7168]">
                      Pick up right where you left off in your active projects.
                    </p>
                  </div>

                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-xs text-[#c9a96e] transition-colors hover:text-[#d4b577] hover:underline"
                  >
                    <span>Browse More Projects</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {loadingEnrollments ? (
                  <div className="flex h-36 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#c9a96e]" />
                  </div>
                ) : enrollments.length === 0 ? (
                  /* Empty state */
                  <div className="rounded-xl border border-dashed border-[#26221c] bg-[#11100e] p-8 text-center">
                    <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2620] bg-[#161411]">
                      <FolderOpen className="h-5 w-5 text-[#6b6256]" />
                    </div>
                    <h3 className="font-serif text-sm font-semibold text-[#e4ddd3]">
                      No Enrolled Projects Yet
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-xs text-[#8a8178]">
                      You haven’t enrolled in any projects. Browse the curriculum library to start building production-ready apps.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 rounded border border-amber-700/60 bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-[#e4ddd3] transition-all hover:bg-amber-900/60 hover:text-white"
                      >
                        <Sparkles className="h-3 w-3 text-[#c9a96e]" />
                        <span>Explore Projects</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* List of enrolled projects */
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {enrollments.map((item) => {
                      const p = item.project;
                      const total = item.totalPhases || 5;
                      const percent = Math.round((item.completedCount / total) * 100);
                      const isComplete = item.completedCount >= total;

                      const diffColor =
                        DIFFICULTY_COLORS[p.difficulty] ??
                        "text-amber-400 bg-amber-950/60 border-amber-900";
                      const trackColor = getTrackColor(p.track);

                      return (
                        <div
                          key={item.enrollmentId}
                          className="flex flex-col justify-between rounded-xl border border-[#221f1a] bg-[#11100e] p-4 shadow-sm transition-all hover:border-[#332e26]"
                        >
                          <div>
                            {/* Badges */}
                            <div className="mb-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`rounded border px-2 py-0.5 text-[10px] font-medium ${trackColor}`}
                                >
                                  {p.track}
                                </span>
                                <span
                                  className={`rounded border px-2 py-0.5 text-[10px] font-medium ${diffColor}`}
                                >
                                  {p.difficulty}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 text-[11px] text-[#6b6256]">
                                <Clock className="h-2.5 w-2.5" />
                                {p.estimatedHours}h
                              </span>
                            </div>

                            {/* Title & Tagline with font-serif */}
                            <h3 className="font-serif text-sm font-semibold text-[#e4ddd3] mb-1">
                              {p.title}
                            </h3>
                            <p className="text-[11px] text-[#8a8178] line-clamp-2 mb-3 leading-relaxed">
                              {p.tagline}
                            </p>

                            {/* Progress bar */}
                            <div className="mb-3.5 rounded-lg border border-[#221f1a] bg-[#14120f] p-2.5">
                              <div className="mb-1 flex items-center justify-between text-[11px]">
                                <span className="text-[#8a8178]">
                                  {isComplete ? (
                                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" /> Complete
                                    </span>
                                  ) : (
                                    `Progress: ${item.completedCount} of ${total} phases`
                                  )}
                                </span>
                                <span className="font-mono text-[#c9a96e]">
                                  {percent}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#221f1a]">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isComplete
                                      ? "bg-emerald-500"
                                      : "bg-gradient-to-r from-amber-700 to-[#c9a96e]"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons matching Image 5 */}
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href={`/projects/${p.slug}/workspace`}
                              className="flex flex-1 items-center justify-center gap-1 rounded border border-amber-600/50 bg-[#d97706] hover:bg-[#b45309] px-3 py-1.5 text-xs font-semibold text-stone-950 transition-all shadow-xs"
                            >
                              <span>{isComplete ? "Review Workspace" : "Continue Project"}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>

                            <Link
                              href={`/projects/${p.slug}`}
                              className="rounded border border-[#262420] bg-transparent px-2.5 py-1.5 text-xs text-[#8a8178] transition-colors hover:border-[#3a352c] hover:text-[#e4ddd3]"
                            >
                              Overview
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
