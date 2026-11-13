"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  CheckCircle2,
  Plus,
  Search,
  Eye,
  Rocket,
  HelpCircle,
  Lightbulb,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type DiscussionItem,
  type DiscussionCategory,
  type ApiProject,
} from "@/lib/api";
import { MarkdownContent } from "@/components/MarkdownContent";

const CATEGORIES: { id: "all" | DiscussionCategory; label: string; icon: typeof MessageSquare }[] = [
  { id: "all", label: "All Topics", icon: MessageSquare },
  { id: "question", label: "Questions & Q&A", icon: HelpCircle },
  { id: "showcase", label: "Showcases", icon: Rocket },
  { id: "architecture", label: "Architecture", icon: Lightbulb },
  { id: "tip", label: "Tips & Hacks", icon: Zap },
];

const CATEGORY_STYLES: Record<DiscussionCategory, { badge: string; label: string }> = {
  general: { badge: "border-neutral-700 bg-neutral-900/60 text-neutral-300", label: "General" },
  question: { badge: "border-sky-500/30 bg-sky-950/40 text-sky-300", label: "Question" },
  showcase: { badge: "border-purple-500/30 bg-purple-950/40 text-purple-300", label: "Showcase" },
  architecture: { badge: "border-amber-500/30 bg-amber-950/40 text-amber-300", label: "Architecture" },
  tip: { badge: "border-emerald-500/30 bg-emerald-950/40 text-emerald-300", label: "Tip" },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DiscussionsPage() {
  const { user } = useAuth();
  const [, startTransition] = useTransition();

  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<"all" | DiscussionCategory>("all");
  const [selectedSort, setSelectedSort] = useState<"trending" | "latest" | "top" | "unanswered">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Projects list for filter & composer
  const [projects, setProjects] = useState<ApiProject[]>([]);

  // New Discussion Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<DiscussionCategory>("general");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load projects list
  useEffect(() => {
    api
      .getProjects()
      .then((res) => {
        setProjects(res.projects || []);
      })
      .catch((err) => console.error("Failed to load projects:", err));
  }, []);

  // Fetch discussions
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    api
      .getDiscussions({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        projectSlug: selectedProject || undefined,
        sort: selectedSort,
        q: debouncedSearch || undefined,
      })
      .then((res) => {
        if (!cancelled) {
          setDiscussions(res.discussions || []);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load discussions:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedSort, debouncedSearch, selectedProject]);

  const handleToggleUpvote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please sign in to upvote discussions.");
      return;
    }

    // Optimistic update
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextUpvoted = !d.hasUpvoted;
          return {
            ...d,
            hasUpvoted: nextUpvoted,
            upvoteCount: nextUpvoted ? d.upvoteCount + 1 : Math.max(0, d.upvoteCount - 1),
          };
        }
        return d;
      })
    );

    try {
      const res = await api.toggleUpvoteDiscussion(id);
      setDiscussions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, hasUpvoted: res.hasUpvoted, upvoteCount: res.upvoteCount } : d))
      );
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setCreateError("Please sign in to create a discussion");
      return;
    }
    if (!newTitle.trim() || newTitle.trim().length < 5) {
      setCreateError("Title must be at least 5 characters long");
      return;
    }
    if (!newContent.trim() || newContent.trim().length < 10) {
      setCreateError("Content must be at least 10 characters long");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const res = await api.createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        projectSlug: newProjectSlug || undefined,
      });

      startTransition(() => {
        setIsModalOpen(false);
        setNewTitle("");
        setNewContent("");
        setNewCategory("general");
        setNewProjectSlug("");
        setPreviewTab("write");
      });

      // Insert at top
      setDiscussions((prev) => [
        {
          ...res.discussion,
          hasUpvoted: false,
          upvoteCount: 0,
          replyCount: 0,
          views: 1,
        },
        ...prev,
      ]);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create discussion");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300 backdrop-blur-sm mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>Developer Community Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Community Discussions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Architectural debates, production gotchas, showcases, and technical Q&A with fellow engineers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] shadow-lg shadow-white/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Discussion</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-black" : "text-neutral-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Search, Project Filter, Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0A0A0E] px-2.5 py-1.5 text-xs text-neutral-300 focus:border-white/30 focus:outline-none cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as typeof selectedSort)}
              className="rounded-lg border border-white/10 bg-[#0A0A0E] px-2.5 py-1.5 text-xs text-neutral-300 focus:border-white/30 focus:outline-none cursor-pointer"
            >
              <option value="trending">🔥 Trending</option>
              <option value="latest">✨ Latest</option>
              <option value="top">▲ Most Upvoted</option>
              <option value="unanswered">💬 Unanswered</option>
            </select>
          </div>
        </div>

        {/* Discussions List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mb-2" />
              <p className="text-xs">Loading discussions...</p>
            </div>
          ) : discussions.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-neutral-600 mb-3" />
              <h3 className="text-sm font-semibold text-white">No discussions found</h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "all" || selectedProject
                  ? "Try clearing filters or search queries to see more discussions."
                  : "Be the first engineer to kick off a discussion or ask an architecture question!"}
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.08] border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.15] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Start a Discussion</span>
              </button>
            </div>
          ) : (
            discussions.map((d) => {
              const catStyle = CATEGORY_STYLES[d.category] || CATEGORY_STYLES.general;
              return (
                <div
                  key={d.id}
                  className="group relative flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#0E0E14] hover:shadow-lg hover:shadow-black/40"
                >
                  {/* Upvote Box */}
                  <button
                    type="button"
                    onClick={(e) => void handleToggleUpvote(d.id, e)}
                    className={`flex flex-col items-center justify-center rounded-lg border px-2 py-1.5 min-w-[42px] transition-all cursor-pointer ${
                      d.hasUpvoted
                        ? "border-indigo-500/50 bg-indigo-950/40 text-indigo-300 shadow-sm shadow-indigo-500/20"
                        : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    }`}
                    title="Upvote discussion"
                  >
                    <span className="text-xs leading-none">▲</span>
                    <span className="mt-1 text-[11px] font-bold">{d.upvoteCount}</span>
                  </button>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    {/* Meta Row: Author, Date, Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                      {/* Author */}
                      <Link
                        href={`/profile/${d.author.username || "builder"}`}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        {d.author.avatar ? (
                          <Image
                            src={d.author.avatar}
                            alt={d.author.name}
                            width={18}
                            height={18}
                            className="rounded-full ring-1 ring-white/10 object-cover"
                          />
                        ) : (
                          <div className="h-4.5 w-4.5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white">
                            {d.author.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-neutral-300">{d.author.name}</span>
                        <span className="text-neutral-500">@{d.author.username}</span>
                      </Link>

                      <span className="text-neutral-600">•</span>
                      <span>{formatTimeAgo(d.createdAt)}</span>

                      <span className="text-neutral-600">•</span>

                      {/* Category Badge */}
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${catStyle.badge}`}>
                        {catStyle.label}
                      </span>

                      {/* Project Link if Present */}
                      {d.projectSlug && (
                        <Link
                          href={`/projects/${d.projectSlug}`}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
                        >
                          📦 {d.projectTitle || d.projectSlug}
                        </Link>
                      )}

                      {/* Resolved Badge */}
                      {d.isResolved && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Solution Found</span>
                        </span>
                      )}
                    </div>

                    {/* Discussion Title */}
                    <Link href={`/discussions/${d.id}`} className="block mt-1.5">
                      <h2 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                        {d.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {d.content.replace(/[#*`_~[\]()]/g, "").slice(0, 180)}
                    </p>

                    {/* Footnote Stats */}
                    <div className="mt-2.5 flex items-center gap-4 text-[11px] text-neutral-500 font-mono">
                      <span className="inline-flex items-center gap-1 text-neutral-400">
                        <MessageSquare className="h-3 w-3 text-neutral-500" />
                        <span>{d.replyCount} {d.replyCount === 1 ? "reply" : "replies"}</span>
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3 text-neutral-500" />
                        <span>{d.views} views</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Discussion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Start a New Discussion</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateDiscussion} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., How to handle token refresh race conditions when 5 concurrent requests fail?"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              {/* Category & Project selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DiscussionCategory)}
                    className="w-full rounded-lg border border-white/10 bg-[#07070A] px-3 py-2 text-xs text-neutral-200 focus:border-white/30 focus:outline-none"
                  >
                    <option value="general">💬 General Discussion</option>
                    <option value="question">❓ Question / Technical Q&A</option>
                    <option value="showcase">🚀 Project Showcase</option>
                    <option value="architecture">💡 Architecture & Design</option>
                    <option value="tip">⚡ Tip / Production Gotcha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Related Project (Optional)
                  </label>
                  <select
                    value={newProjectSlug}
                    onChange={(e) => setNewProjectSlug(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#07070A] px-3 py-2 text-xs text-neutral-200 focus:border-white/30 focus:outline-none"
                  >
                    <option value="">None (General)</option>
                    {projects.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content with Markdown Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Content (Markdown & Code snippets supported)
                  </label>
                  <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("write")}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        previewTab === "write" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("preview")}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        previewTab === "preview" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {previewTab === "write" ? (
                  <textarea
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your question, architecture breakdown, or code challenge in detail. Use ```typescript code blocks for code snippets."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs font-mono text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-y"
                    required
                  />
                ) : (
                  <div className="min-h-[190px] max-h-[300px] overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs">
                    {newContent.trim() ? (
                      <MarkdownContent>{newContent}</MarkdownContent>
                    ) : (
                      <span className="text-neutral-500 italic">Nothing to preview yet.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-white/10 px-3.5 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Publish Discussion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
