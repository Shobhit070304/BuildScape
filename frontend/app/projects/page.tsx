"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Layers,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Server,
  Layout,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { mapApiProject } from "@/lib/projects";
import { api } from "@/lib/api";
import type { Project } from "@/lib/projects";

function renderTrackIcon(track: string) {
  return (
    <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-slate-200">
      {track.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase()}
    </span>
  );
}

const CATEGORY_OPTIONS = [
  { label: "Frontend", icon: Layout },
  { label: "Backend", icon: Server },
  { label: "Full-Stack", icon: Layers },
  { label: "AI", icon: Sparkles },
  { label: "Systems", icon: Terminal },
];

const LEVEL_OPTIONS = [
  { label: "Beginner", difficulty: "Beginner" },
  { label: "Intermediate", difficulty: "Intermediate" },
  { label: "Advanced", difficulty: "Advanced" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFromDb, setIsFromDb] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("track")
  );
  const [selectedLevelLabel, setSelectedLevelLabel] = useState<string | null>(null);

  const loadProjects = useCallback(() => {
    api
      .getProjects()
      .then((data) => {
        if (data?.projects && data.projects.length > 0) {
          setProjects(data.projects.map(mapApiProject));
          setIsFromDb(true);
        } else {
          setProjects([]);
          setLoadError("No projects currently available in the curriculum database.");
        }
      })
      .catch((err) => {
        setProjects([]);
        setLoadError(err.message ?? "Database connection failed. Please ensure backend is running.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const retryProjects = () => {
    setIsLoading(true);
    setLoadError(null);
    loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    return projects.filter((p: Project) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.track.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));

      const matchCategory = !selectedCategory || p.category === selectedCategory;

      const matchTrack =
        !selectedTrack ||
        p.track === selectedTrack ||
        p.techStack.some((t) => t.toLowerCase() === selectedTrack.toLowerCase());

      const matchLevel =
        !selectedLevelLabel ||
        p.difficulty.toLowerCase() === selectedLevelLabel.toLowerCase();

      return matchSearch && matchCategory && matchTrack && matchLevel;
    });
  }, [projects, search, selectedCategory, selectedTrack, selectedLevelLabel]);

  const hasFilters = Boolean(search || selectedCategory || selectedTrack || selectedLevelLabel);

  function clearFilters() {
    setSearch("");
    setSelectedCategory(null);
    setSelectedTrack(null);
    setSelectedLevelLabel(null);
  }

  const availableTracks = useMemo(
    () => Array.from(new Set(projects.map((project) => project.track))).sort((a, b) => a.localeCompare(b)),
    [projects]
  );

  return (
    <>
      <Navbar />
      <main className="w-full bg-[#050507] min-h-screen text-white pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
          {/* Header Banner — Centered & Scaled */}
          <div className="mb-8 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="pill-mono">
                <Sparkles className="h-3 w-3 text-white" />
                <span>CURRICULUM BLUEPRINTS</span>
              </span>
              {isFromDb && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 text-[0.68rem] font-mono font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live Sync
                </span>
              )}
            </div>

            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
              Production-Grade Engineering Blueprints
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-400">
              Real-world systems built from scratch. Every phase covers architecture decisions, deep-dive mental models, structured tasks, code checkpoints, and pitfalls.
            </p>
          </div>

          {/* Filter Bar Card */}
          <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 sm:p-6 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4">
            {/* Row 1: CATEGORY / TYPE */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-16 sm:w-20 shrink-0 pt-1 text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                DOMAIN
              </span>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    selectedCategory === null
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  All Domains
                </button>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat.label;
                  const Icon = cat.icon;
                  return (
                    <button
                      type="button"
                      key={cat.label}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.label)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-sm"
                          : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: TRACK */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-16 sm:w-20 shrink-0 pt-1 text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                TRACK
              </span>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedTrack(null)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    selectedTrack === null
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  All Tracks
                </button>
                {availableTracks.map((track) => {
                  const isSelected = selectedTrack === track;
                  return (
                    <button
                      type="button"
                      key={track}
                      onClick={() => setSelectedTrack(isSelected ? null : track)}
                      className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-sm"
                          : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {renderTrackIcon(track)}
                      <span>{track}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: LEVEL & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="w-16 sm:w-20 shrink-0 text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                  LEVEL
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLevelLabel(null)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                      selectedLevelLabel === null
                        ? "bg-white text-black shadow-sm"
                        : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = selectedLevelLabel === lvl.label;
                    return (
                      <button
                        type="button"
                        key={lvl.label}
                        onClick={() => setSelectedLevelLabel(isSelected ? null : lvl.label)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white text-black shadow-sm"
                            : "bg-[#0E0E14] text-neutral-400 border border-white/10 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white hover:bg-white/[0.12] transition-all ml-1"
                    >
                      <X className="h-3 w-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  aria-label="Search projects"
                  placeholder="Search by title, stack, keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#060608] py-2 pl-9 pr-8 text-xs text-white placeholder-neutral-500 outline-none transition-colors focus:border-white/30"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-white" />
              <span className="font-mono text-xs text-neutral-400">
                Showing <strong className="text-white font-semibold">{filtered.length}</strong> {filtered.length === 1 ? "blueprint" : "blueprints"}
              </span>
            </div>
          </div>

          {/* Project Cards Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="font-mono text-xs text-neutral-400">Connecting to curriculum database...</p>
            </div>
          ) : loadError && projects.length === 0 ? (
            <div className="mx-auto my-8 max-w-lg rounded-2xl border border-rose-900/40 bg-[#0A0A0E] p-7 text-center shadow-2xl">
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-800/40 bg-rose-950/40 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="font-sans text-lg font-bold text-white mb-1.5">
                Database Offline or Unreachable
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-5">
                {loadError}
              </p>
              <button
                type="button"
                onClick={retryProjects}
                className="btn-primary text-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-[#0A0A0E]/60">
              <p className="mb-2 text-sm text-neutral-400">
                No blueprints matched your criteria.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer text-xs font-semibold text-white underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
