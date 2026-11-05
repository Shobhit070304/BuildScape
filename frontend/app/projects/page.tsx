"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Database,
  Layers,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { mapApiProject } from "@/lib/projects";
import { api } from "@/lib/api";
import type { Project } from "@/lib/projects";

function renderTrackIcon(track: string) {
  return (
    <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-300">
      {track.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase()}
    </span>
  );
}

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
    // Initial loading is represented by the initial state; this effect only starts the request.
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
        p.techStack.some((t) => t.toLowerCase().includes(q));
      const matchTrack =
        !selectedTrack ||
        p.track === selectedTrack ||
        p.techStack.some((t) => t.toLowerCase() === selectedTrack.toLowerCase());
      const matchLevel = !selectedLevelLabel ||
        p.difficulty.toLowerCase() === selectedLevelLabel.toLowerCase();
      return matchSearch && matchTrack && matchLevel;
    });
  }, [projects, search, selectedTrack, selectedLevelLabel]);

  const hasFilters = !!(search || selectedTrack || selectedLevelLabel);

  function clearFilters() {
    setSearch("");
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
      <main className="w-full bg-[#0a0a0a] min-h-screen text-[#f0eae1] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-7">
          {/* Top Category Label (Image 1) */}
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-mono font-bold tracking-widest text-accent uppercase">
              LIBRARY
            </p>
            {isFromDb && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950/50 border border-emerald-900/60 px-1.5 py-0.5 text-[0.62rem] font-medium text-emerald-400">
                <Database className="h-2.5 w-2.5" />
                Live Sync
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text mb-6">
            Curated projects across every track.
          </h1>

          {/* Filter Section (Image 1 layout) */}
          <div className="space-y-3.5 mb-5">
            {/* Row 1: TRACK */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-12 sm:w-14 shrink-0 pt-1 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                TRACK
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
                {/* All Track Pill */}
                <button
                  onClick={() => setSelectedTrack(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${selectedTrack === null
                      ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                      : "bg-[#14120f] text-[#8a8178] border border-[#24211b] hover:text-[#e4ddd3] hover:border-[#38332a]"
                    }`}
                >
                  All
                </button>

                {/* Track Pills with brand icons */}
                {availableTracks.map((track) => {
                  const isSelected = selectedTrack === track;
                  return (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(isSelected ? null : track)}
                      className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${isSelected
                          ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                          : "bg-[#14120f] text-[#c4bbb0] border border-[#24211b] hover:border-[#38332a] hover:text-white"
                        }`}
                    >
                      {renderTrackIcon(track)}
                      <span>{track}</span>
                    </button>
                  );
                })}

              </div>
            </div>

            {/* Row 2: LEVEL */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-12 sm:w-14 shrink-0 pt-1 text-[11px] font-mono tracking-widest text-text-muted uppercase">
                LEVEL
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
                {/* All Level Pill */}
                <button
                  onClick={() => setSelectedLevelLabel(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${selectedLevelLabel === null
                      ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                      : "bg-[#14120f] text-[#8a8178] border border-[#24211b] hover:text-[#e4ddd3] hover:border-[#38332a]"
                    }`}
                >
                  All
                </button>

                {/* Level Pills */}
                {LEVEL_OPTIONS.map((lvl) => {
                  const isSelected = selectedLevelLabel === lvl.label;
                  return (
                    <button
                      key={lvl.label}
                      onClick={() =>
                        setSelectedLevelLabel(isSelected ? null : lvl.label)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${isSelected
                          ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                          : "bg-[#14120f] text-[#8a8178] border border-[#24211b] hover:text-[#e4ddd3] hover:border-[#38332a]"
                        }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#24211b] bg-[#14120f] px-2.5 py-1 text-xs text-[#8a8178] hover:text-[#e4ddd3] transition-all ml-auto"
                  >
                    <X className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Thin divider with project count (Image 1) */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-mono text-xs text-zinc-400">
                {filtered.length} projects
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative w-48 sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                aria-label="Search projects"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-[#121212] py-1.5 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-700"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Project results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
              <p className="font-mono text-xs text-[#8a8178]">Connecting to database & loading curriculum...</p>
            </div>
          ) : loadError && projects.length === 0 ? (
            <div className="mx-auto my-8 max-w-lg rounded-2xl border border-rose-900/50 bg-linear-to-b from-[#18110e] to-[#0d0b09] p-7 text-center shadow-2xl">
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-800/40 bg-rose-950/40 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#f0eae1] mb-1.5">
                Database Offline or Unreachable
              </h2>
              <p className="text-xs text-[#9a9187] leading-relaxed mb-5">
                {loadError}
              </p>
              <button
                onClick={retryProjects}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center rounded-xl border border-dashed border-[#24211b] bg-[#0e0d0b">
              <p className="mb-2 text-xs text-[#8a8178]">
                No projects matched your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="cursor-pointer text-xs text-accent hover:text-accent-hover hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
