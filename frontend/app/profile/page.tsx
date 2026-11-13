"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import {
  LogOut,
  ArrowRight,
  Loader2,
  FolderOpen,
  X,
  Flag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectVerificationModal } from "@/components/ProjectVerificationModal";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type EnrolledProjectItem,
  type UserReportedIssue,
  type CurriculumIssueStatus,
} from "@/lib/api";
import { TechIcon } from "@/components/TechBadge";

const STATUS_STYLES: Record<
  CurriculumIssueStatus,
  { label: string; badge: string }
> = {
  open: { label: "Pending Review", badge: "border-amber-800/50 bg-amber-950/30 text-amber-300" },
  in_review: { label: "In Review", badge: "border-sky-800/50 bg-sky-950/30 text-sky-300" },
  resolved: { label: "Resolved", badge: "border-emerald-800/50 bg-emerald-950/30 text-emerald-300" },
};

export default function ProfilePage() {
  const { user, isLoading: authLoading, login, logout, updateUsername, updateProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledProjectItem[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [issues, setIssues] = useState<UserReportedIssue[]>([]);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Modals for Actions
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);

  // Profile Edit fields
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [githubDraft, setGithubDraft] = useState("");
  const [twitterDraft, setTwitterDraft] = useState("");
  const [portfolioDraft, setPortfolioDraft] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [selectedProjectForVerify, setSelectedProjectForVerify] = useState<{
    slug: string;
    title: string;
    repoUrl?: string | null;
    liveUrl?: string | null;
    certificateId?: string | null;
  } | null>(null);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsernameDraft(user.username || "");
      setNameDraft(user.name || "");
      setBioDraft(user.bio || "");
      setLocationDraft(user.location || "");
      setGithubDraft(user.githubUrl || "");
      setTwitterDraft(user.twitterUrl || "");
      setPortfolioDraft(user.portfolioUrl || "");
      setSkillsList(user.skills || []);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingEnrollments(true);

    api
      .getEnrolledProjects()
      .then((data) => {
        if (!cancelled && data?.enrollments) setEnrollments(data.enrollments);
      })
      .catch(() => {
        if (!cancelled) setEnrollments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingEnrollments(false);
      });

    api
      .getMyIssues()
      .then((data) => {
        if (!cancelled && data?.issues) setIssues(data.issues);
      })
      .catch(() => {
        if (!cancelled) setIssues([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setUsernameError(null);
    try {
      if (usernameDraft !== user?.username) {
        await updateUsername(usernameDraft.trim());
      }
      await updateProfile({
        name: nameDraft.trim(),
        bio: bioDraft.trim(),
        location: locationDraft.trim(),
        githubUrl: githubDraft.trim() || undefined,
        twitterUrl: twitterDraft.trim() || undefined,
        portfolioUrl: portfolioDraft.trim() || undefined,
        skills: skillsList,
      });
      setShowEditModal(false);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : "Failed to save profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput("");
    }
  };

  const completedProjectsCount = enrollments.filter(
    (item) => Boolean(item.completedAt) || item.completedCount >= (item.totalPhases || 5)
  ).length;

  const totalCompletedPhases = enrollments.reduce((acc, curr) => acc + curr.completedCount, 0);

  const joinedMonthYear = "Aug 2026";

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-24 pt-8 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {authLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : !user ? (
            /* Not logged in */
            <div className="mx-auto max-w-sm py-20 text-center">
              <h1 className="mb-2 font-serif text-2xl font-bold text-white">
                BuildScape Profile
              </h1>
              <p className="mb-6 text-xs text-neutral-400 leading-relaxed">
                Sign in with Google to view your active projects and developer stats.
              </p>
              <div className="flex justify-center scale-95 origin-center">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) void login(res.credential);
                  }}
                  onError={() => setSignInError("Sign-in failed. Please try again.")}
                  shape="pill"
                  theme="filled_black"
                  size="medium"
                />
              </div>
              {signInError && <p className="mt-3 text-xs text-rose-300">{signInError}</p>}
            </div>
          ) : (
            /* ───────────────── MINIMAL PROFILE LAYOUT (IMAGE 2) ───────────────── */
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              {/* ── Left Column: Identity, Big Stats, and Recent Activity (8 Cols) ── */}
              <div className="lg:col-span-8 space-y-8">
                {/* User Identity Header */}
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={52}
                      height={52}
                      className="rounded-full border border-white/20 shadow-md shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] font-serif text-xl font-bold text-white">
                      {user.name[0]?.toUpperCase() || "S"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-sans text-2xl font-extrabold tracking-tight text-white leading-tight">
                        {user.name}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(true)}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <p className="font-mono text-xs text-neutral-400 mt-0.5">
                      @{user.username} · {user.email} ·{" "}
                      <span className="text-neutral-300">FREE</span> · joined {joinedMonthYear}
                    </p>
                    {user.location && (
                      <p className="text-xs text-neutral-400 mt-1">📍 {user.location}</p>
                    )}
                    {user.bio && (
                      <p className="text-xs text-neutral-300 mt-2 max-w-xl leading-relaxed">{user.bio}</p>
                    )}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {user.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-white/[0.05] border border-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimal High-Impact Stats Bar (3 Big Numbers matching screenshot) */}
                <div className="flex items-center gap-12 sm:gap-16 pt-2">
                  <div>
                    <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
                      {String(completedProjectsCount).padStart(2, "0")}
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase mt-1">
                      SHIPPED
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
                      {String(enrollments.length).padStart(2, "0")}
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase mt-1">
                      ACTIVE
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
                      {String(totalCompletedPhases).padStart(2, "0")}
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase mt-1">
                      TASKS
                    </div>
                  </div>
                </div>

                {/* ── RECENT ACTIVITY SECTION ── */}
                <section className="pt-2">
                  <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400">
                      RECENT ACTIVITY
                    </span>
                    <span className="font-mono text-xs text-neutral-500">
                      {enrollments.length} of your last
                    </span>
                  </div>

                  {loadingEnrollments ? (
                    <div className="flex h-28 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-[#0A0A0E] p-6 text-center">
                      <FolderOpen className="mx-auto mb-2 h-7 w-7 text-neutral-500" />
                      <p className="text-xs text-neutral-400 mb-3">No active projects yet.</p>
                      <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200"
                      >
                        <span>Browse Projects</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {enrollments.map((item) => {
                        const isComplete =
                          Boolean(item.completedAt) ||
                          item.completedCount >= (item.totalPhases || 5);

                        return (
                          <div
                            key={item.enrollmentId}
                            className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-3.5 sm:p-4 transition-all hover:border-white/20 hover:bg-[#0E0E14] shadow-xs"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0E0E14] text-white shadow-sm">
                                <TechIcon name={item.project.track} className="h-5 w-5 shrink-0" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-sans font-bold text-sm text-white group-hover:text-neutral-100 truncate">
                                    {item.project.title}
                                  </h3>
                                  {isComplete && (
                                    <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                                      Done
                                    </span>
                                  )}
                                </div>
                                <p className="font-mono text-[11px] text-neutral-400 mt-0.5 truncate">
                                  {item.project.track} · {item.project.difficulty} · started 1 month ago
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {isComplete && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedProjectForVerify({
                                      slug: item.project.slug,
                                      title: item.project.title,
                                      repoUrl: item.githubRepoUrl,
                                      liveUrl: item.liveDemoUrl,
                                      certificateId: item.certificateId,
                                    })
                                  }
                                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>{item.isVerified ? "Proof" : "Verify"}</span>
                                </button>
                              )}
                              <Link
                                href={`/projects/${item.project.slug}/workspace`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 group-hover:text-white transition-colors cursor-pointer"
                                title="Open Workspace"
                              >
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* ── Right Column: Account & Actions Cards (4 Cols) ── */}
              <div className="lg:col-span-4 space-y-4">
                {/* ACCOUNT CARD */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4.5 shadow-sm space-y-3 font-mono text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    ACCOUNT
                  </span>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-400">PLAN</span>
                    <span className="text-white font-medium">Free</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                    <span className="text-neutral-400">JOINED</span>
                    <span className="text-neutral-300">{joinedMonthYear}</span>
                  </div>
                </div>

                {/* ACTIONS CARD */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4.5 shadow-sm space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-semibold block mb-2">
                    ACTIONS
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Configure Profile &amp; Bio</span>
                  </button>

                  <Link
                    href="/showcases"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Browse Showcases</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowIssuesModal(true)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Flag className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Reported Issues</span>
                    </span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[10px] text-neutral-400">
                      {issues.length}
                    </span>
                  </button>

                  <Link
                    href={`/profile/${user.username || "builder"}`}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                    <span>View Public Profile</span>
                  </Link>

                  <div className="border-t border-white/[0.06] pt-2 mt-2">
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── MODAL: Configure Profile & Bio ── */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <h3 className="font-sans text-base font-bold text-white">Configure Profile</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050507] px-3 py-1.5 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Username Handle
                  </label>
                  <input
                    type="text"
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050507] px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-white/30"
                  />
                  {usernameError && <p className="text-[11px] text-rose-300 mt-1">{usernameError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Developer Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    placeholder="Short bio or headline..."
                    className="w-full rounded-lg border border-white/10 bg-[#050507] p-2.5 text-xs text-white outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Tech Skills (Press Enter to add)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="e.g. Go, React, Python"
                      className="flex-1 rounded-lg border border-white/10 bg-[#050507] px-3 py-1.5 text-xs text-white outline-none focus:border-white/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  {skillsList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skillsList.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-2 py-0.5 text-xs font-mono text-neutral-300"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => setSkillsList(skillsList.filter((s) => s !== skill))}
                            className="text-neutral-500 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Reported Issues ── */}
        {showIssuesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <h3 className="font-sans text-base font-bold text-white">Your Reported Issues</h3>
                <button
                  type="button"
                  onClick={() => setShowIssuesModal(false)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {issues.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  You haven&apos;t reported any curriculum issues yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => {
                    const statusInfo = STATUS_STYLES[issue.status] || STATUS_STYLES.open;
                    return (
                      <div
                        key={issue._id}
                        className="rounded-xl border border-white/[0.08] bg-[#0E0E14] p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-white">
                            {typeof issue.projectId === "object" && issue.projectId !== null
                              ? issue.projectId.title
                              : "Curriculum Phase"}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-neutral-300">{issue.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Modal for Certificate */}
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
