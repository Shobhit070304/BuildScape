"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  Loader2,
  Plus,
  Trash2,
  Users,
  MessageSquare,
  Layers,
  Flag,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type ApiProject,
  type ProjectPayload,
  type AdminUserItem,
  type AdminDiscussionItem,
} from "@/lib/api";
import { normalizeDifficulty } from "@/lib/projects";

type ProjectDraft = ProjectPayload;

const emptyProject = (): ProjectDraft => ({
  slug: "",
  title: "",
  tagline: "",
  description: "",
  whatYouWillLearn: [],
  track: "",
  difficulty: "Beginner",
  estimatedHours: 1,
  techStack: [],
  phases: [{ id: "phase-1", orderIndex: 1, title: "", content: "" }],
});

function splitList(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function asDraft(project: ApiProject): ProjectDraft {
  return {
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    description: project.description ?? "",
    whatYouWillLearn: project.whatYouWillLearn ?? [],
    track: project.track,
    difficulty: normalizeDifficulty(project.difficulty),
    estimatedHours: project.estimatedHours,
    techStack: project.techStack ?? [],
    phases: (project.phases ?? []).map((phase, index) => ({
      id: phase.id,
      orderIndex: index + 1,
      title: phase.title,
      content: phase.content ?? "",
    })),
  };
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "discussions" | "users">("overview");

  // Overview Stats
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalEnrollments: number;
    totalProjects: number;
    totalDiscussions: number;
    openIssuesCount: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [draft, setDraft] = useState<ProjectDraft>(emptyProject);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewPhase, setPreviewPhase] = useState<number | null>(null);

  // Discussions Moderation State
  const [adminDiscussions, setAdminDiscussions] = useState<AdminDiscussionItem[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [discussionSearch, setDiscussionSearch] = useState("");

  // Users Management State
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.getAdminOverview();
      setStats(res.stats);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const result = await api.getProjects();
      setProjects(result.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load projects");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadDiscussions = useCallback(async () => {
    setLoadingDiscussions(true);
    try {
      const res = await api.getAdminDiscussions({ q: discussionSearch || undefined });
      setAdminDiscussions(res.discussions);
    } catch (err) {
      console.error("Failed to load admin discussions:", err);
    } finally {
      setLoadingDiscussions(false);
    }
  }, [discussionSearch]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAdminUsers({ q: userSearch || undefined });
      setAdminUsers(res.users);
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch]);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadOverview();
      void loadProjects();
    }
  }, [authLoading, user, loadOverview, loadProjects]);

  useEffect(() => {
    if (activeTab === "discussions") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadDiscussions();
    }
    if (activeTab === "users") {
      void loadUsers();
    }
  }, [activeTab, loadDiscussions, loadUsers]);

  const heading = useMemo(() => (editingSlug ? "Edit project" : "Create project"), [editingSlug]);

  const startNew = () => {
    setEditingSlug(null);
    setDraft(emptyProject());
    setPreviewPhase(null);
    setError(null);
    setMessage(null);
  };

  const editProject = async (slug: string) => {
    setError(null);
    setMessage(null);
    try {
      const result = await api.getProject(slug);
      setDraft(asDraft(result.project));
      setEditingSlug(slug);
      setPreviewPhase(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load project details");
    }
  };

  const updatePhase = (index: number, changes: Partial<ProjectDraft["phases"][number]>) => {
    setDraft((current) => ({
      ...current,
      phases: current.phases.map((phase, phaseIndex) =>
        phaseIndex === index ? { ...phase, ...changes } : phase
      ),
    }));
  };

  const movePhase = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= draft.phases.length) return;
    setDraft((current) => {
      const nextPhases = [...current.phases];
      const [item] = nextPhases.splice(index, 1);
      nextPhases.splice(newIndex, 0, item);
      return {
        ...current,
        phases: nextPhases.map((phase, phaseIndex) => ({
          ...phase,
          orderIndex: phaseIndex + 1,
        })),
      };
    });
  };

  const addPhase = () => {
    setDraft((current) => ({
      ...current,
      phases: [
        ...current.phases,
        {
          id: `phase-${current.phases.length + 1}`,
          orderIndex: current.phases.length + 1,
          title: "",
          content: "",
        },
      ],
    }));
  };

  const removePhase = (index: number) => {
    setDraft((current) => ({
      ...current,
      phases: current.phases
        .filter((_, phaseIndex) => phaseIndex !== index)
        .map((phase, phaseIndex) => ({ ...phase, orderIndex: phaseIndex + 1 })),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: ProjectPayload = {
      ...draft,
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      tagline: draft.tagline.trim(),
      description: (draft.description ?? "").trim(),
      track: draft.track.trim(),
      estimatedHours: Number(draft.estimatedHours),
      phases: draft.phases.map((phase, index) => ({
        id: phase.id.trim(),
        orderIndex: index + 1,
        title: phase.title.trim(),
        content: phase.content.trim(),
      })),
    };

    try {
      if (editingSlug) {
        await api.updateProject(editingSlug, payload);
        setMessage("Project updated successfully");
      } else {
        await api.createProject(payload);
        setMessage("Project published successfully");
      }
      await loadProjects();
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (slug: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${slug}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteProject(slug);
      setMessage("Project deleted successfully");
      if (editingSlug === slug) startNew();
      await loadProjects();
      await loadOverview();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this discussion thread as admin?")) return;
    try {
      await api.deleteAdminDiscussion(id);
      setAdminDiscussions((prev) => prev.filter((d) => d.id !== id));
      await loadOverview();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete discussion");
    }
  };

  const handleToggleUserRole = async (targetUserId: string, currentRole: "user" | "admin") => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change this user's role to ${nextRole.toUpperCase()}?`)) return;
    setTogglingRole(targetUserId);
    try {
      await api.toggleAdminUserRole(targetUserId, nextRole);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setTogglingRole(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
          <Loader2 className="h-6 w-6 animate-spin text-white mb-2" />
          <p className="text-xs">Authenticating admin session...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#050507] text-white">
        <Navbar />
        <div className="mx-auto max-w-md py-24 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h1 className="text-xl font-bold">Admin Privileges Required</h1>
          <p className="mt-2 text-xs text-neutral-400">
            You do not have administrative authorization to access the BuildScape control plane.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300 backdrop-blur-sm mb-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Control Plane</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Platform Administration
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Manage curriculum projects, review user progress, moderate community discussions, and inspect issues.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/issues"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-neutral-200 hover:bg-white hover:text-black transition-colors"
            >
              <Flag className="h-3.5 w-3.5 text-amber-400" />
              <span>Reported Issues</span>
              {stats?.openIssuesCount ? (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300 font-bold">
                  {stats.openIssuesCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {/* Global Analytics Overview Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
              Registered Users
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
              {stats?.totalUsers ?? (loadingStats ? "..." : 0)}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
              Active Enrollments
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
              {stats?.totalEnrollments ?? (loadingStats ? "..." : 0)}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
              Projects
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
              {stats?.totalProjects ?? projects.length}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
              Discussions
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
              {stats?.totalDiscussions ?? (loadingStats ? "..." : 0)}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
              Open Issues
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1 block">
              {stats?.openIssuesCount ?? (loadingStats ? "..." : 0)}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Overview & Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "projects"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Curriculum Projects ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discussions")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "discussions"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Discussions Moderation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>User Accounts</span>
          </button>
        </div>

        {/* ──────────────── TAB 1: OVERVIEW & HEALTH ──────────────── */}
        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6">
              <h2 className="text-base font-semibold text-white mb-2">Quick Navigation Shortcuts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab("projects"); startNew(); }}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  <Plus className="h-5 w-5 text-indigo-400 mb-2" />
                  <h3 className="text-xs font-semibold text-white">Create New Project</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Author a new project curriculum with structured phases.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("discussions")}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5 text-purple-400 mb-2" />
                  <h3 className="text-xs font-semibold text-white">Moderate Community</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Review live threads, solve issues, and remove spam.</p>
                </button>

                <Link
                  href="/admin/issues"
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-white/20 hover:bg-white/[0.05] transition-all"
                >
                  <Flag className="h-5 w-5 text-amber-400 mb-2" />
                  <h3 className="text-xs font-semibold text-white">Inspect Curriculum Issues</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Review feedback on broken links or unclear code.</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 2: PROJECTS & CURRICULUM ──────────────── */}
        {activeTab === "projects" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Sidebar list of projects */}
            <aside className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <span className="text-xs font-semibold text-white">Curriculum Projects</span>
                <button
                  type="button"
                  onClick={startNew}
                  className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-black hover:bg-neutral-200 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </button>
              </div>

              {loadingProjects ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
                  {projects.map((p) => (
                    <div
                      key={p.slug}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        editingSlug === p.slug
                          ? "border-white/30 bg-white/[0.08]"
                          : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void editProject(p.slug)}
                        className="text-left flex-1 min-w-0 cursor-pointer mr-2"
                      >
                        <h4 className="text-xs font-semibold text-white truncate">{p.title}</h4>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">{p.slug}</p>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="p-1 text-neutral-400 hover:text-white"
                          title="View live overview"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDeleteProject(p.slug)}
                          disabled={deleting}
                          className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

            {/* Project Edit / Create Form */}
            <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                <h2 className="text-base font-semibold text-white">{heading}</h2>
                {editingSlug && (
                  <span className="text-xs font-mono text-neutral-400">Editing: {editingSlug}</span>
                )}
              </div>

              {message && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Slug</label>
                    <input
                      type="text"
                      value={draft.slug}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                      placeholder="e.g. real-time-collab"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Real-Time Collaboration Engine"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={draft.tagline}
                    onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                    placeholder="Short punchy summary"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Track</label>
                    <input
                      type="text"
                      value={draft.track}
                      onChange={(e) => setDraft({ ...draft, track: e.target.value })}
                      placeholder="e.g. Next.js & TypeScript"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Difficulty</label>
                    <select
                      value={draft.difficulty}
                      onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as ProjectDraft["difficulty"] })}
                      className="w-full rounded-lg border border-white/10 bg-[#07070A] px-3 py-1.5 text-xs text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      min={1}
                      value={draft.estimatedHours}
                      onChange={(e) => setDraft({ ...draft, estimatedHours: Number(e.target.value) })}
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Tech Stack (comma or newline separated)
                  </label>
                  <input
                    type="text"
                    value={draft.techStack.join(", ")}
                    onChange={(e) => setDraft({ ...draft, techStack: splitList(e.target.value) })}
                    placeholder="TypeScript, Next.js, Redis, Docker"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Description (Markdown supported)
                  </label>
                  <textarea
                    rows={4}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white font-mono"
                  />
                </div>

                {/* Phases section */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-white">Curriculum Phases ({draft.phases.length})</h3>
                    <button
                      type="button"
                      onClick={addPhase}
                      className="inline-flex items-center gap-1 rounded bg-white/[0.08] px-2.5 py-1 text-xs text-white hover:bg-white/[0.15] cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Phase</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draft.phases.map((phase, idx) => (
                      <div key={phase.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-neutral-500 font-bold">Phase {idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => movePhase(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => movePhase(idx, 1)}
                              disabled={idx === draft.phases.length - 1}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewPhase(previewPhase === idx ? null : idx)}
                              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                              title="Toggle markdown preview"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhase(idx)}
                              className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={phase.id}
                            onChange={(e) => updatePhase(idx, { id: e.target.value })}
                            placeholder="phase-id"
                            className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={phase.title}
                            onChange={(e) => updatePhase(idx, { title: e.target.value })}
                            placeholder="Phase Title"
                            className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white"
                          />
                        </div>

                        {previewPhase === idx ? (
                          <div className="rounded border border-white/10 bg-black/40 p-3 text-xs max-h-48 overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{phase.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <textarea
                            rows={3}
                            value={phase.content}
                            onChange={(e) => updatePhase(idx, { content: e.target.value })}
                            placeholder="Phase instructional content in markdown..."
                            className="w-full rounded border border-white/10 bg-white/[0.04] p-2 text-xs font-mono text-white resize-y"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{editingSlug ? "Save Changes" : "Publish Project"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 3: DISCUSSIONS MODERATION ──────────────── */}
        {activeTab === "discussions" && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08] mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Community Discussions Moderation</h2>
                <p className="text-xs text-neutral-400">Review discussions, investigate spam, and remove violating posts.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={discussionSearch}
                  onChange={(e) => setDiscussionSearch(e.target.value)}
                  placeholder="Filter discussions..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {loadingDiscussions ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : adminDiscussions.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">No discussions match your filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] text-neutral-400 font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Title & Category</th>
                      <th className="py-2.5 px-3">Author</th>
                      <th className="py-2.5 px-3">Upvotes</th>
                      <th className="py-2.5 px-3">Replies</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {adminDiscussions.map((d) => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <Link href={`/discussions/${d.id}`} target="_blank" className="font-semibold text-white hover:underline line-clamp-1">
                            {d.title}
                          </Link>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">{d.category}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-300">
                          @{d.author.username}
                        </td>
                        <td className="py-3 px-3 font-mono">{d.upvoteCount}</td>
                        <td className="py-3 px-3 font-mono">{d.replyCount}</td>
                        <td className="py-3 px-3 text-neutral-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => void handleDeleteDiscussion(d.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                            title="Delete thread"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 4: USERS MANAGEMENT ──────────────── */}
        {activeTab === "users" && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08] mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Registered User Accounts</h2>
                <p className="text-xs text-neutral-400">Search users, view progress enrollments, and toggle admin permissions.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, username, email..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] text-neutral-400 font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Enrolled</th>
                      <th className="py-2.5 px-3">Completed</th>
                      <th className="py-2.5 px-3">Joined</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <Link href={`/profile/${u.username}`} target="_blank" className="flex items-center gap-2 hover:underline">
                            {u.avatar ? (
                              <Image src={u.avatar} alt={u.name} width={22} height={22} className="rounded-full" />
                            ) : (
                              <div className="h-5.5 w-5.5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                {u.name.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-white block">{u.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">@{u.username}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-950/40 border border-purple-500/30 text-purple-300"
                              : "bg-white/[0.04] border border-white/10 text-neutral-300"
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">{u.enrolledCount}</td>
                        <td className="py-3 px-3 font-mono">{u.completedCount}</td>
                        <td className="py-3 px-3 text-neutral-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            disabled={togglingRole === u.id || u.email === user.email}
                            onClick={() => void handleToggleUserRole(u.id, u.role)}
                            className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer"
                          >
                            {togglingRole === u.id ? "Updating..." : u.role === "admin" ? "Demote" : "Make Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
