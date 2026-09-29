"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Database } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { TechBadge } from "@/components/TechBadge";
import { getAllProjects, getAllTracks } from "@/lib/projects";
import { api } from "@/lib/api";
import type { Project } from "@/lib/projects";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export default function ProjectsPage() {
  const initialProjects = getAllProjects();
  const allTracks = getAllTracks();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isFromDb, setIsFromDb] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Fetch dynamic projects from MongoDB API on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getProjects()
      .then((data) => {
        if (isMounted && data?.projects && data.projects.length > 0) {
          const dbProjects: Project[] = data.projects.map((p) => ({
            id: p._id || p.slug,
            slug: p.slug,
            title: p.title,
            tagline: p.tagline,
            track: p.track,
            difficulty: p.difficulty as any,
            estimatedHours: p.estimatedHours,
            techStack: p.techStack || [],
            phases: (p.phases as any) || [],
          }));
          setProjects(dbProjects);
          setIsFromDb(true);
        }
      })
      .catch((err) => {
        console.info("Using local fallback projects data:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p: Project) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));

      // Multi-technology filter: matches track OR any technology in techStack
      const matchTrack =
        !selectedTrack ||
        p.track === selectedTrack ||
        p.techStack.includes(selectedTrack);

      const matchDiff = !selectedDifficulty || p.difficulty === selectedDifficulty;
      return matchSearch && matchTrack && matchDiff;
    });
  }, [projects, search, selectedTrack, selectedDifficulty]);

  const hasFilters = !!(search || selectedTrack || selectedDifficulty);

  function clearFilters() {
    setSearch("");
    setSelectedTrack(null);
    setSelectedDifficulty(null);
  }

  const diffChipBase =
    "cursor-pointer rounded-md border border-[#222222] bg-transparent px-2.5 py-1 text-xs text-[#7a7168] transition-all hover:border-[#333333] hover:text-[#e4ddd3]";
  const diffChipActive =
    "cursor-pointer rounded-md border border-amber-800/55 bg-amber-950/35 px-2.5 py-1 text-xs font-medium text-[#d4a855]";

  return (
    <>
      <Navbar />
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[0.7rem] font-medium uppercase tracking-widest text-[#4a4540]">
                  Curriculum Library
                </p>
                {isFromDb && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-950/50 border border-emerald-900/60 px-1.5 py-0.5 text-[0.62rem] font-medium text-emerald-400">
                    <Database className="h-2.5 w-2.5" />
                    Live Database
                  </span>
                )}
              </div>
              <h1 className="mb-1.5 font-serif text-3xl font-bold text-[#e4ddd3]">
                Production Projects
              </h1>
              <p className="text-sm text-[#7a7168]">
                {projects.length} advanced projects across {allTracks.join(", ")}. Pick a project to build end-to-end.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4a4540]" />
            <input
              type="text"
              placeholder="Search by technology (e.g. Next.js, Python, Redis, Docker, Tree-sitter)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#222222] bg-[#111111] py-2.5 pl-9 pr-9 text-sm text-[#e4ddd3] placeholder-[#5a5450] outline-none transition-colors focus:border-[#333333]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center text-[#4a4540] hover:text-[#e4ddd3]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Technology & Difficulty Filter Chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-[#5a5450] font-medium">Technology:</span>

            {allTracks.map((tech) => {
              const isSelected = selectedTrack === tech;
              return (
                <button
                  key={tech}
                  onClick={() => setSelectedTrack(isSelected ? null : tech)}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-amber-500/50 scale-105" : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <TechBadge name={tech} size="sm" showIcon={true} />
                </button>
              );
            })}

            <span className="mx-1 text-[#2a2a2a]">|</span>

            <span className="mr-1 text-xs text-[#5a5450] font-medium">Difficulty:</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                className={selectedDifficulty === d ? diffChipActive : diffChipBase}
              >
                {d}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#222222] bg-transparent px-2.5 py-1 text-xs text-[#7a7168] transition-all hover:text-[#e4ddd3] ml-auto"
              >
                <X className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* Results Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-2 text-sm text-[#7a7168]">No projects matched your criteria.</p>
              <button
                onClick={clearFilters}
                className="cursor-pointer text-sm text-[#c9a96e] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-[#4a4540]">
                Showing {filtered.length} of {projects.length} projects
                {selectedTrack && ` featuring ${selectedTrack}`}
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
