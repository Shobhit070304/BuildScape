"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  GitBranch,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
  X,
  Search,
  ShieldCheck,
  Loader2,
  FolderCode,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TechIcon } from "@/components/TechBadge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export interface ShowcaseItem {
  id: string;
  title: string;
  track: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  timeAgo: string;
  repoUrl: string;
  demoUrl?: string;
  projectSlug: string;
  certificateId?: string;
}

// Our platform tracks and levels only
const TRACKS = ["All", "Golang", "TypeScript", "Python", "Spring Boot", "Rust", "React"] as const;
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export default function ShowcasesPage() {
  const { user } = useAuth();
  const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form submission state
  const [formTitle, setFormTitle] = useState("");
  const [formTrack, setFormTrack] = useState("Golang");
  const [formDifficulty, setFormDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [formDescription, setFormDescription] = useState("");
  const [formRepo, setFormRepo] = useState("");
  const [formDemo, setFormDemo] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const loadShowcases = useCallback(() => {
    setLoading(true);
    api
      .getVerifiedShowcases()
      .then((data) => {
        if (data?.showcases) {
          setShowcases(data.showcases);
        } else {
          setShowcases([]);
        }
      })
      .catch(() => {
        setShowcases([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShowcases();
  }, [loadShowcases]);

  const filteredShowcases = useMemo(() => {
    return showcases.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.track.toLowerCase().includes(q);

      const matchTrack = selectedTrack === "All" || item.track.toLowerCase() === selectedTrack.toLowerCase();
      const matchLevel = selectedLevel === "All" || item.difficulty.toLowerCase() === selectedLevel.toLowerCase();

      return matchSearch && matchTrack && matchLevel;
    });
  }, [showcases, search, selectedTrack, selectedLevel]);

  const handleSubmitBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formRepo) return;

    const newItem: ShowcaseItem = {
      id: `sc-user-${Date.now()}`,
      title: formTitle.trim(),
      track: formTrack,
      difficulty: formDifficulty,
      description: formDescription.trim() || "Deployed production system built on BuildScape.",
      authorName: user?.name || "Community Builder",
      authorHandle: `@${user?.username || "builder"}`,
      authorAvatar: user?.avatar,
      timeAgo: "Just now",
      repoUrl: formRepo.trim(),
      demoUrl: formDemo.trim() || undefined,
      projectSlug: "habitly-go-rest-api",
    };

    setShowcases([newItem, ...showcases]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsSubmitOpen(false);
      setFormTitle("");
      setFormRepo("");
      setFormDemo("");
      setFormDescription("");
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-24 pt-8 text-white relative">
        {/* Subtle Obsidian Atmospheric Top Radial Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-96 w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-400">
                  COMMUNITY SHOWCASE
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  · {showcases.length} verified {showcases.length === 1 ? "build" : "builds"}
                </span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
                What real engineers are shipping.
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Verified implementations built by developers on BuildScape. Every submission features a public repository with passing checkpoints and architecture trees.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              className="btn-primary inline-flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Share Your Build</span>
            </button>
          </div>

          {/* Sleek Boxless Filters: Track, Level, Search (No outer box!) */}
          <div className="mb-10 space-y-3.5">
            {/* TRACK ROW (Boxless sleek inline tags) */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold w-12 shrink-0">
                TRACK
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {TRACKS.map((track) => {
                  const isSelected = selectedTrack === track;
                  return (
                    <button
                      type="button"
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-xs font-bold"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {track !== "All" && <TechIcon name={track} className="h-3.5 w-3.5 shrink-0" />}
                      <span>{track}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEVEL ROW (Strictly our 3 Levels: Beginner, Intermediate, Advanced - Boxless) */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-semibold w-12 shrink-0">
                LEVEL
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-xs font-bold"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEARCH ROW */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Layers className="h-3.5 w-3.5" />
                <span>
                  {filteredShowcases.length} {filteredShowcases.length === 1 ? "build" : "builds"}
                </span>
                {(selectedTrack !== "All" || selectedLevel !== "All" || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrack("All");
                      setSelectedLevel("All");
                      setSearch("");
                    }}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search builds or authors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0E] py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 outline-none transition-colors focus:border-white/30 font-mono shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Showcases Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
              <p className="font-mono text-xs text-neutral-400">Loading verified builds...</p>
            </div>
          ) : filteredShowcases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShowcases.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 sm:p-6 transition-all duration-300 hover:border-white/20 hover:bg-[#0E0E14] shadow-xl shadow-black/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                >
                  <div>
                    {/* Top Capsules */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-neutral-300">
                          <TechIcon name={item.track} className="h-3 w-3 shrink-0" />
                          <span>{item.track}</span>
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                          {item.difficulty}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">{item.timeAgo}</span>
                    </div>

                    <h3 className="font-sans text-base font-bold text-white group-hover:text-neutral-100 transition-colors mb-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    {/* Author Byline */}
                    <div className="flex items-center gap-2.5 border-t border-white/[0.06] pt-3 mb-4">
                      {item.authorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.authorAvatar}
                          alt={item.authorName}
                          className="h-7 w-7 rounded-full border border-white/20 object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] font-mono text-[11px] font-bold text-white">
                          {item.authorName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-sans text-xs font-semibold text-neutral-200 truncate">
                          {item.authorName}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500 truncate">
                          {item.authorHandle}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Links */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.repoUrl && (
                          <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
                          >
                            <GitBranch className="h-3 w-3" />
                            <span>Repo</span>
                          </a>
                        )}

                        {item.demoUrl && (
                          <a
                            href={item.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-950/30 px-2.5 py-1 text-xs font-mono text-indigo-300 transition-colors hover:border-indigo-500/50 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>

                      <Link
                        href={`/projects/${item.projectSlug}`}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <span>View Project</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean, Real Empty State: Zero fake data! */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-12 text-center max-w-xl mx-auto shadow-xl">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-400 mb-4">
                <FolderCode className="h-6 w-6" />
              </div>
              <h2 className="font-sans text-base sm:text-lg font-bold text-white mb-2">
                Be the first builder in the showcase
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 max-w-md mx-auto">
                No verified community builds have been published yet. Complete any 8-phase project, submit your public GitHub repository, and claim your verified showcase listing.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/projects" className="btn-primary text-xs">
                  <span>Browse Projects</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(true)}
                  className="btn-secondary text-xs"
                >
                  Submit Completed Build
                </button>
              </div>
            </div>
          )}

          {/* Submission Modal */}
          {isSubmitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0C0C12] p-6 text-white shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="absolute right-4 top-4 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-base font-bold font-sans text-white">
                    Submit Your Completed Project
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                  Connect your real GitHub repository and live deployment URL to be featured in the community showcase.
                </p>

                {formSuccess ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400 mb-2" />
                    <p className="text-xs font-semibold text-emerald-300">
                      Build added to showcase feed!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBuild} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-1">
                        PROJECT TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Habitly — Go REST API with pgx & Chi"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-neutral-400 mb-1">
                          TRACK *
                        </label>
                        <select
                          value={formTrack}
                          onChange={(e) => setFormTrack(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                        >
                          <option value="Golang">Golang</option>
                          <option value="TypeScript">TypeScript</option>
                          <option value="Python">Python</option>
                          <option value="Spring Boot">Spring Boot</option>
                          <option value="Rust">Rust</option>
                          <option value="React">React</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-neutral-400 mb-1">
                          LEVEL *
                        </label>
                        <select
                          value={formDifficulty}
                          onChange={(e) =>
                            setFormDifficulty(
                              e.target.value as "Beginner" | "Intermediate" | "Advanced"
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-1">
                        GITHUB REPOSITORY URL *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/your-username/your-repo"
                        value={formRepo}
                        onChange={(e) => setFormRepo(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/30 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-1">
                        LIVE PRODUCTION URL (OPTIONAL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://my-app.fly.dev"
                        value={formDemo}
                        onChange={(e) => setFormDemo(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/30 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-1">
                        ARCHITECTURE HIGHLIGHTS
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Key technical decisions, database indexes, or concurrency models implemented..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSubmitOpen(false)}
                        className="btn-secondary text-xs"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs">
                        Publish to Showcase
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
