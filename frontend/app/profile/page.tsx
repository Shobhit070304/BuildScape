"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
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
  Pencil,
  Check,
  X,
  Flag,
  User as UserIcon,
  ShieldCheck,
  Award,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectVerificationModal } from "@/components/ProjectVerificationModal";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type EnrolledProjectItem,
  type UserReportedIssue,
  type CurriculumIssueCategory,
  type CurriculumIssueStatus,
} from "@/lib/api";
import { DIFFICULTY_COLORS, getTrackColor } from "@/lib/projects";

const STATUS_STYLES: Record<
  CurriculumIssueStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  open: {
    label: "Pending Review",
    badge: "border-amber-800/50 bg-amber-950/30 text-amber-300",
    icon: Clock,
  },
  in_review: {
    label: "In Review",
    badge: "border-sky-800/50 bg-sky-950/30 text-sky-300",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    badge: "border-emerald-800/50 bg-emerald-950/30 text-emerald-300",
    icon: CheckCircle2,
  },
};

const CATEGORY_LABELS: Record<CurriculumIssueCategory, string> = {
  unclear: "Unclear instructions",
  broken: "Broken link or code",
  outdated: "Outdated information",
  other: "Other issue",
};

export default function ProfilePage() {
  const { user, isLoading: authLoading, login, logout, updateUsername } = useAuth();
  const [activeTab, setActiveTab] = useState<"projects" | "issues" | "account">("projects");
  const [enrollments, setEnrollments] = useState<EnrolledProjectItem[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [issues, setIssues] = useState<UserReportedIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [selectedProjectForVerify, setSelectedProjectForVerify] = useState<{
    slug: string;
    title: string;
    repoUrl?: string | null;
    liveUrl?: string | null;
    certificateId?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // The first authenticated profile load should show its loading state immediately.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingEnrollments(true);
    setLoadingIssues(true);

    api
      .getEnrolledProjects()
      .then((data) => {
        if (!cancelled) setEnrollments(data.enrollments ?? []);
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load enrolled projects:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingEnrollments(false);
      });

    api
      .getMyIssues()
      .then((data) => {
        if (!cancelled) setIssues(data.issues ?? []);
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load reported issues:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingIssues(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalCompletedPhases = enrollments.reduce(
    (sum, item) => sum + item.completedCount,
    0
  );

  const completedProjectsCount = enrollments.filter(
    (item) => Boolean(item.completedAt) || item.completedCount >= (item.totalPhases || 1)
  ).length;

  const handleUsernameSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUsername(true);
    setUsernameError(null);
    try {
      await updateUsername(usernameDraft);
      setEditingUsername(false);
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : "Could not update username");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not log out. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {authLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : !user ? (
            /* Not logged in state */
            <div className="mx-auto max-w-sm py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <h1 className="mb-2 font-serif text-2xl font-bold text-white">
                Your BuildScape Profile
              </h1>
              <p className="mb-6 text-xs text-neutral-400 leading-relaxed">
                Sign in with Google to view your enrolled projects, track your learning progress, and see reported issues.
              </p>
              <div className="flex justify-center scale-95 origin-center">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (!res.credential) {
                      setSignInError("Google did not return a credential. Please try again.");
                      return;
                    }
                    void login(res.credential)
                      .then(() => setSignInError(null))
                      .catch((error: unknown) => {
                        setSignInError(
                          error instanceof Error ? error.message : "Sign-in failed. Please try again."
                        );
                      });
                  }}
                  onError={() => setSignInError("Google sign-in failed. Please try again.")}
                  shape="pill"
                  theme="filled_black"
                  text="signin_with"
                  size="medium"
                />
              </div>
              {signInError && <p role="alert" className="mt-3 text-xs text-rose-300">{signInError}</p>}
            </div>
          ) : (
            /* Logged in User Profile */
            <div className="space-y-6">
              {/* High-level Stats Overview Bar */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 sm:grid-cols-4 shadow-sm">
                <div className="border-r border-white/[0.06] pr-2 last:border-r-0">
                  <span className="text-[0.62rem] uppercase tracking-wider text-neutral-400 font-mono">
                    Enrolled Projects
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-bold text-white">
                    {enrollments.length}
                  </p>
                </div>
                <div className="border-r border-white/[0.06] pr-2 last:border-r-0">
                  <span className="text-[0.62rem] uppercase tracking-wider text-neutral-400 font-mono">
                    Completed Phases
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-bold text-white">
                    {totalCompletedPhases}
                  </p>
                </div>
                <div className="border-r border-white/[0.06] pr-2 last:border-r-0">
                  <span className="text-[0.62rem] uppercase tracking-wider text-neutral-400 font-mono">
                    Completed Blueprints
                  </span>
                  <p className="mt-0.5 font-mono text-lg font-bold text-emerald-400">
                    {completedProjectsCount}
                  </p>
                </div>
                <div>
                  <span className="text-[0.62rem] uppercase tracking-wider text-neutral-400 font-mono">
                    Learning Status
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </p>
                </div>
              </div>

              {/* 2-Column Dashboard Layout with Sidebar */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* ── Left Sidebar Navigation ── */}
                <aside className="w-full shrink-0 md:w-60">
                  {/* User Profile Mini Card */}
                  <div className="mb-3 rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-3.5 shadow-sm">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={42}
                          height={42}
                          className="rounded-full border border-white/20 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] font-serif text-base font-bold text-white">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h2 className="truncate font-serif text-sm font-semibold text-white">
                            {user.name}
                          </h2>
                          {user.role === "admin" && (
                            <span className="rounded-full border border-white/20 bg-white/[0.06] px-1.5 py-0.2 text-[9px] font-medium text-neutral-300">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="truncate font-mono text-[11px] text-neutral-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation buttons */}
                  <nav
                    className="flex flex-row gap-1.5 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0"
                    aria-label="Profile tabs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab("projects")}
                      className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "projects"
                          ? "border border-white/20 bg-white text-black font-semibold shadow-xs"
                          : "border border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Enrolled Projects</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                          activeTab === "projects"
                            ? "bg-neutral-200 text-black font-bold"
                            : "bg-[#07070A] border border-white/5 text-neutral-400"
                        }`}
                      >
                        {enrollments.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("issues")}
                      className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "issues"
                          ? "border border-white/20 bg-white text-black font-semibold shadow-xs"
                          : "border border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        <span>Reported Issues</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                          activeTab === "issues"
                            ? "bg-neutral-200 text-black font-bold"
                            : "bg-[#07070A] border border-white/5 text-neutral-400"
                        }`}
                      >
                        {issues.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("account")}
                      className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "account"
                          ? "border border-white/20 bg-white text-black font-semibold shadow-xs"
                          : "border border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Account Details</span>
                      </span>
                    </button>
                  </nav>

                  {/* Sidebar Footer Logout */}
                  <div className="mt-4 hidden border-t border-white/[0.06] pt-3 md:block">
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-xs text-neutral-400 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-rose-400"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </aside>

                {/* ── Right Content Area ── */}
                <section className="min-w-0 flex-1">
                  {logoutError && (
                    <p role="alert" className="mb-4 text-xs text-rose-300">
                      {logoutError}
                    </p>
                  )}

                  {/* ───────────────── Tab 1: Enrolled Projects ───────────────── */}
                  {activeTab === "projects" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="font-serif text-lg font-bold text-white">
                            My Enrolled Projects
                          </h2>
                          <p className="text-[11px] text-neutral-400">
                            Pick up right where you left off in your active projects.
                          </p>
                        </div>

                        <Link
                          href="/projects"
                          className="inline-flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-white"
                        >
                          <span>Browse More Projects</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                      {loadingEnrollments ? (
                        <div className="flex h-36 items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      ) : enrollments.length === 0 ? (
                        /* Empty state */
                        <div className="rounded-xl border border-dashed border-white/10 bg-[#0A0A0E] p-8 text-center">
                          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050507]">
                            <FolderOpen className="h-5 w-5 text-neutral-400" />
                          </div>
                          <h3 className="font-serif text-sm font-semibold text-white">
                            No Enrolled Projects Yet
                          </h3>
                          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-400">
                            You haven’t enrolled in any projects. Browse the curriculum library to start building production-ready apps.
                          </p>
                          <div className="mt-4">
                            <Link
                              href="/projects"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm transition-all hover:bg-neutral-200"
                            >
                              <Sparkles className="h-3 w-3 text-black" />
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
                            const isComplete = Boolean(item.completedAt) || item.completedCount >= total;

                            const diffColor =
                              DIFFICULTY_COLORS[p.difficulty] ??
                              "border-white/10 bg-white/[0.04] text-neutral-300";
                            const trackColor = getTrackColor(p.track);

                            return (
                              <div
                                key={item.enrollmentId}
                                className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 shadow-sm transition-all hover:border-white/20"
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
                                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                      <Clock className="h-2.5 w-2.5" />
                                      {p.estimatedHours}h
                                    </span>
                                  </div>

                                  {/* Title & Tagline with font-serif */}
                                  <h3 className="font-serif text-sm font-semibold text-white mb-1">
                                    {p.title}
                                  </h3>
                                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                                    {p.tagline}
                                  </p>

                                  {/* Progress bar */}
                                  <div className="space-y-1 mb-4">
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-neutral-400">Progress</span>
                                      <span className="font-mono text-white">
                                        {item.completedCount}/{total} phases ({percent}%)
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          isComplete ? "bg-emerald-400" : "bg-white"
                                        }`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Proof of Work Certificate Badge or Verification Trigger */}
                                  {item.isVerified && item.certificateId ? (
                                    <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-3 py-2 text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <div className="min-w-0">
                                          <p className="font-semibold text-emerald-300 leading-tight">
                                            Verified Proof of Work
                                          </p>
                                          <p className="font-mono text-[10px] text-emerald-500 truncate">
                                            ID: {item.certificateId}
                                          </p>
                                        </div>
                                      </div>
                                      <Link
                                        href={`/verify/${item.certificateId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                      >
                                        <Award className="h-3 w-3" />
                                        <span>Proof</span>
                                        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                      </Link>
                                    </div>
                                  ) : isComplete ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedProjectForVerify({
                                          slug: p.slug,
                                          title: p.title,
                                          repoUrl: item.githubRepoUrl,
                                          liveUrl: item.liveDemoUrl,
                                          certificateId: item.certificateId,
                                        })
                                      }
                                      className="mb-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 py-2 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-950/40"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                      <span>Verify & Claim Certificate</span>
                                    </button>
                                  ) : null}
                                </div>

                                <div className="pt-2 border-t border-white/[0.06]">
                                  <Link
                                    href={`/projects/${p.slug}/workspace`}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] py-2 text-xs font-semibold text-neutral-200 transition-all hover:bg-white hover:text-black"
                                  >
                                    <span>Continue Blueprint</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ───────────────── Tab 2: Reported Issues ───────────────── */}
                  {activeTab === "issues" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="font-serif text-lg font-bold text-white">
                            Curriculum Issue Reports
                          </h2>
                          <p className="text-[11px] text-neutral-400">
                            Track the status of curriculum issues, typos, and broken links you reported.
                          </p>
                        </div>
                      </div>

                      {loadingIssues ? (
                        <div className="flex h-36 items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      ) : issues.length === 0 ? (
                        /* Empty state */
                        <div className="rounded-xl border border-dashed border-white/10 bg-[#0A0A0E] p-8 text-center">
                          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#050507]">
                            <Flag className="h-5 w-5 text-neutral-400" />
                          </div>
                          <h3 className="font-serif text-sm font-semibold text-white">
                            No Issues Reported Yet
                          </h3>
                          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-400">
                            If you ever encounter unclear instructions, broken links, or outdated code while building in the workspace, click &quot;Report issue&quot; in the workspace header. You can track progress on fixes right here.
                          </p>
                        </div>
                      ) : (
                        /* List of issues */
                        <div className="space-y-3.5">
                          {issues.map((issue) => {
                            const statusInfo =
                              STATUS_STYLES[issue.status] || STATUS_STYLES.open;
                            const StatusIcon = statusInfo.icon;
                            const categoryLabel =
                              CATEGORY_LABELS[issue.category] || issue.category;
                            const projectTitle =
                              typeof issue.projectId === "object" && issue.projectId !== null
                                ? issue.projectId.title
                                : "Curriculum Phase";
                            const projectSlug =
                              typeof issue.projectId === "object" && issue.projectId !== null
                                ? issue.projectId.slug
                                : null;

                            return (
                              <div
                                key={issue._id}
                                className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 shadow-sm transition-all hover:border-white/20"
                              >
                                <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2.5">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-serif text-sm font-semibold text-white">
                                        {projectTitle}
                                      </span>
                                      <span className="text-neutral-600">•</span>
                                      <span className="font-mono text-xs text-neutral-300">
                                        {issue.phaseTitle}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <span className="rounded border border-white/10 bg-[#050507] px-2 py-0.5 text-[10px] text-neutral-300">
                                        {categoryLabel}
                                      </span>
                                      <span className="text-[11px] text-neutral-400">
                                        {new Date(issue.createdAt).toLocaleDateString(undefined, {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusInfo.badge}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusInfo.label}
                                  </span>
                                </div>

                                <div className="rounded-lg border border-white/[0.06] bg-[#050507] p-3 text-xs leading-relaxed text-neutral-300">
                                  <p className="whitespace-pre-wrap">{issue.message}</p>
                                </div>

                                {projectSlug && (
                                  <div className="mt-3 flex justify-end">
                                    <Link
                                      href={`/projects/${projectSlug}/workspace?phase=${encodeURIComponent(issue.phaseId)}`}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-white"
                                    >
                                      <span>View Phase in Workspace</span>
                                      <ArrowRight className="h-3 w-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ───────────────── Tab 3: Account Details & Settings ───────────────── */}
                  {activeTab === "account" && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-white">
                          Account Details & Settings
                        </h2>
                        <p className="text-[11px] text-neutral-400">
                          Manage your public username handle and account preferences.
                        </p>
                      </div>

                      {/* Profile Card */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3.5">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={52}
                                height={52}
                                className="rounded-full border border-white/20 shadow-sm"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] font-serif text-lg font-bold text-white">
                                {user.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif text-base font-semibold text-white">
                                  {user.name}
                                </h3>
                                <span
                                  className={`rounded-full border px-2 py-0.2 text-[10px] font-medium ${
                                    user.role === "admin"
                                      ? "border-white/20 bg-white/[0.08] text-neutral-200"
                                      : "border-white/10 bg-white/[0.04] text-neutral-400"
                                  }`}
                                >
                                  {user.role === "admin" ? "Admin" : "Learner"}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-400">{user.email}</p>
                              <p className="mt-0.5 font-mono text-xs text-neutral-400">
                                @{user.username}
                              </p>
                            </div>
                          </div>

                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-200 hover:bg-white hover:text-black transition-all"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        {/* Username Customization */}
                        <div className="mt-5 border-t border-white/[0.06] pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-white">
                                Public Username Handle
                              </h4>
                              <p className="text-[11px] text-neutral-400">
                                Customize your unique username across Buildscape.
                              </p>
                            </div>
                            {!editingUsername && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUsernameDraft(user.username ?? "");
                                  setUsernameError(null);
                                  setEditingUsername(true);
                                }}
                                className="inline-flex cursor-pointer items-center gap-1 text-xs text-neutral-400 hover:text-white"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Edit handle</span>
                              </button>
                            )}
                          </div>

                          {editingUsername && (
                            <form
                              onSubmit={handleUsernameSave}
                              className="mt-3 flex max-w-md flex-wrap items-center gap-2"
                            >
                              <label className="sr-only" htmlFor="profile-username">
                                Public username
                              </label>
                              <span className="text-xs text-neutral-400">@</span>
                              <input
                                id="profile-username"
                                required
                                minLength={3}
                                maxLength={24}
                                pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                                autoComplete="off"
                                value={usernameDraft}
                                onChange={(event) => setUsernameDraft(event.target.value)}
                                className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#050507] px-2.5 py-1.5 text-xs text-neutral-200 outline-none focus:border-white/30"
                              />
                              <button
                                type="submit"
                                disabled={savingUsername}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                              >
                                {savingUsername ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                disabled={savingUsername}
                                onClick={() => {
                                  setEditingUsername(false);
                                  setUsernameDraft(user.username ?? "");
                                  setUsernameError(null);
                                }}
                                className="cursor-pointer rounded-md border border-white/10 p-1.5 text-neutral-400 hover:text-white"
                                aria-label="Cancel username edit"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              {usernameError && (
                                <p role="alert" className="w-full text-[11px] text-rose-300">
                                  {usernameError}
                                </p>
                              )}
                              <p className="w-full text-[10px] text-neutral-500">
                                3–24 letters or numbers; use single hyphens between words.
                              </p>
                            </form>
                          )}
                        </div>
                      </div>

                      {/* Sign Out Card */}
                      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 shadow-sm flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-white">Sign Out</h4>
                          <p className="text-[11px] text-neutral-400">
                            Securely log out of your session on this device.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleLogout()}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-[#050507] px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-red-500/50 hover:bg-red-950/20 hover:text-red-300"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Verification Modal for Enrolled Projects */}
        {selectedProjectForVerify && (
          <ProjectVerificationModal
            project={selectedProjectForVerify}
            isOpen={Boolean(selectedProjectForVerify)}
            onClose={() => setSelectedProjectForVerify(null)}
            existingCertificateId={selectedProjectForVerify.certificateId}
            existingGithubUrl={selectedProjectForVerify.repoUrl}
            existingLiveUrl={selectedProjectForVerify.liveUrl}
            onVerified={(data) => {
              setEnrollments((prev) =>
                prev.map((e) =>
                  e.project.slug === selectedProjectForVerify.slug
                    ? {
                        ...e,
                        isVerified: true,
                        certificateId: data.certificateId,
                        githubRepoUrl: data.githubRepoUrl,
                        liveDemoUrl: data.liveDemoUrl || e.liveDemoUrl,
                      }
                    : e
                )
              );
            }}
          />
        )}
      </main>
    </>
  );
}
