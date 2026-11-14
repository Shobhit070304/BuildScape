"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Layers,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { TrackSidebarRail } from "@/components/TrackSidebarRail";
import { mapApiProject } from "@/lib/projects";
import { api, type EnrolledProjectItem } from "@/lib/api";
import type { Project } from "@/lib/projects";
import { useAuth } from "@/context/AuthContext";
import { TechIcon } from "@/components/TechBadge";

// Strictly 3 Levels: Beginner, Intermediate, Advanced
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

// Our real platform tracks
const CORE_TRACKS = [
  "Golang",
  "TypeScript",
  "Python",
  "Spring Boot",
  "Rust",
  "React",
];

export default function ProjectsPage() {
  const { user, savedProjects } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [enrollments, setEnrollments] = useState<EnrolledProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const loadProjects = useCallback(() => {
    api
      .getProjects()
      .then((data) => {
        if (data?.projects && data.projects.length > 0) {
          setProjects(data.projects.map(mapApiProject));
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

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (user) {
      api
        .getEnrolledProjects()
        .then((res) => setEnrollments(res.enrollments || []))
        .catch(() => setEnrollments([]));
    }
  }, [user]);

  // Combine core tracks with any unique tracks in project database
  const availableTracks = useMemo(() => {
    const fromProjects = Array.from(new Set(projects.map((p) => p.track)));
    return Array.from(new Set([...CORE_TRACKS, ...fromProjects])).filter(Boolean);
  }, [projects]);

  // Working on projects: either user's active enrollments, or flagship starters
  const workingOnList = useMemo(() => {
    if (enrollments.length > 0) {
      return enrollments.slice(0, 2).map((item) => ({
        slug: item.project.slug,
        title: item.project.title,
        track: item.project.track,
        difficulty: item.project.difficulty,
        startedText: item.enrolledAt
          ? new Date(item.enrolledAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })
          : "recently",
      }));
    }
    // Default starter projects
    if (projects.length >= 2) {
      return [
        {
          slug: projects[0].slug,
          title: projects[0].title,
          track: projects[0].track,
          difficulty: projects[0].difficulty,
          startedText: "1 month ago",
        },
        {
          slug: projects[1].slug,
          title: projects[1].title,
          track: projects[1].track,
          difficulty: projects[1].difficulty,
          startedText: "3 months ago",
        },
      ];
    }
    return [];
  }, [enrollments, projects]);

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
        p.track.toLowerCase() === selectedTrack.toLowerCase() ||
        p.techStack.some((t) => t.toLowerCase() === selectedTrack.toLowerCase());

      const matchLevel =
        !selectedLevel || p.difficulty.toLowerCase() === selectedLevel.toLowerCase();

      const matchSaved = !showSavedOnly || savedProjects.includes(p.slug);

      return matchSearch && matchTrack && matchLevel && matchSaved;
    });
  }, [projects, search, selectedTrack, selectedLevel, showSavedOnly, savedProjects]);

  return (
    <>
      <Navbar />
      <main className="w-full bg-[#050507] min-h-screen text-white pb-24 relative overflow-hidden">
        {/* Track Hover Slider Rail */}
        <TrackSidebarRail
          selectedTrack={selectedTrack}
          onSelectTrack={(track) => {
            setShowSavedOnly(false);
            setSelectedTrack(track);
          }}
          showSavedOnly={showSavedOnly}
          onToggleSaved={setShowSavedOnly}
        />

        {/* Rich Ambient Atmospheric Lighting */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(99,102,241,0.14),rgba(168,85,247,0.06)_40%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-5%] top-[20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.06)_0%,transparent_70%)] blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[-5%] top-[50%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] blur-[130px]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 relative">
          {/* ───────────────── 1. NOW WORKING ON SECTION (TOP) ───────────────── */}
          {workingOnList.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-400">
                    NOW WORKING ON
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                    Pick up where you left off.
                  </h2>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  {workingOnList.length} active
                </span>
              </div>

              <div className="space-y-2.5">
                {workingOnList.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/projects/${item.slug}/workspace`}
                    className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-3.5 sm:p-4 transition-all hover:border-white/20 hover:bg-[#0E0E14] shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0E0E14] text-white shadow-sm">
                        <TechIcon name={item.track} className="h-5 w-5 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-sans font-bold text-sm text-white group-hover:text-neutral-100 truncate">
                          {item.title}
                        </h3>
                        <p className="font-mono text-[11px] text-neutral-400 mt-0.5 truncate">
                          {item.track} · {item.difficulty} · started {item.startedText}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:text-white shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ───────────────── 2. FILTERS (STACK & LEVEL ON TOP) ───────────────── */}
          <div className="mb-8 space-y-3.5">
            {/* TRACK ROW (Boxless, Sleek Pills) */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold w-14 shrink-0">
                TRACK
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(false);
                    setSelectedTrack(null);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    selectedTrack === null && !showSavedOnly
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(!showSavedOnly);
                    setSelectedTrack(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    showSavedOnly
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Bookmark className={`h-3 w-3 ${showSavedOnly ? "fill-white" : ""}`} />
                  <span>Saved{savedProjects.length > 0 ? ` (${savedProjects.length})` : ""}</span>
                </button>

                {availableTracks.map((track) => {
                  const isSelected = selectedTrack === track && !showSavedOnly;
                  return (
                    <button
                      type="button"
                      key={track}
                      onClick={() => {
                        setShowSavedOnly(false);
                        setSelectedTrack(isSelected ? null : track);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-xs font-bold"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <TechIcon name={track} className="h-3.5 w-3.5 shrink-0" />
                      <span>{track}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEVEL ROW (Strictly 3 Levels: Beginner, Intermediate, Advanced - Boxless) */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold w-14 shrink-0">
                LEVEL
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    selectedLevel === null
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  All
                </button>
                {LEVEL_OPTIONS.map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSelectedLevel(isSelected ? null : lvl)}
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

            {/* SEARCH & COUNTER ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Layers className="h-3.5 w-3.5 text-neutral-400" />
                <span>
                  {filtered.length} {filtered.length === 1 ? "project" : "projects"}
                </span>
                {(selectedTrack || selectedLevel || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrack(null);
                      setSelectedLevel(null);
                      setSearch("");
                    }}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>

              {/* Search Bar with Ctrl+K */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  aria-label="Search projects"
                  placeholder="Search anything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0E] py-1.5 pl-8 pr-14 text-xs text-white placeholder-neutral-500 outline-none transition-colors focus:border-white/30 font-mono shadow-xs"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1 py-0.2 text-[9px] font-mono text-neutral-400">
                  Ctrl K
                </span>
              </div>
            </div>
          </div>

          {/* ───────────────── 3. PROJECT CARDS GRID (2 IN ONE LINE) ───────────────── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
              <p className="font-mono text-xs text-neutral-400">Loading curriculum projects...</p>
            </div>
          ) : loadError && projects.length === 0 ? (
            <div className="mx-auto my-8 max-w-lg rounded-2xl border border-rose-900/40 bg-[#0A0A0E] p-7 text-center shadow-2xl">
              <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl border border-rose-800/40 bg-rose-950/40 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white mb-1.5">
                Curriculum Service Offline
              </h3>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">{loadError}</p>
              <button
                type="button"
                onClick={loadProjects}
                className="btn-primary inline-flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-12 text-center shadow-xl">
              <p className="font-sans text-sm font-semibold text-white mb-1">
                No projects matched your criteria.
              </p>
              <p className="text-xs text-neutral-400 mb-4">
                Try clearing your track or level filters to view all projects.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTrack(null);
                  setSelectedLevel(null);
                  setSearch("");
                }}
                className="btn-secondary text-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
