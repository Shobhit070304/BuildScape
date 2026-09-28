"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects, getAllTracks } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export default function ProjectsPage() {
  const allProjects = getAllProjects();
  const allTracks = getAllTracks();

  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allProjects.filter((p: Project) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));
      const matchTrack = !selectedTrack || p.track === selectedTrack;
      const matchDiff = !selectedDifficulty || p.difficulty === selectedDifficulty;
      return matchSearch && matchTrack && matchDiff;
    });
  }, [allProjects, search, selectedTrack, selectedDifficulty]);

  const hasFilters = !!(search || selectedTrack || selectedDifficulty);

  function clearFilters() {
    setSearch("");
    setSelectedTrack(null);
    setSelectedDifficulty(null);
  }

  const chipBase =
    "cursor-pointer rounded-md border border-[#222222] bg-transparent px-2.5 py-1 text-xs text-[#7a7168] transition-all hover:border-[#333333] hover:text-[#e4ddd3]";
  const chipActive =
    "cursor-pointer rounded-md border border-amber-800/55 bg-amber-950/35 px-2.5 py-1 text-xs font-medium text-[#d4a855]";

  return (
    <>
      <Navbar />
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-widest text-[#4a4540]">
              Library
            </p>
            <h1 className="mb-1.5 font-serif text-3xl font-bold text-[#e4ddd3]">
              All Projects
            </h1>
            <p className="text-sm text-[#7a7168]">
              {allProjects.length} projects across {allTracks.length} tracks. Pick one and start building.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4a4540]" />
            <input
              type="text"
              placeholder="Search projects, tech stacks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#222222] bg-[#111111] py-2 pl-9 pr-9 text-sm text-[#e4ddd3] placeholder-[#5a5450] outline-none transition-colors focus:border-[#333333]"
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

          {/* Filter chips */}
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-[#4a4540]">Filter:</span>

            {allTracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(selectedTrack === track ? null : track)}
                className={selectedTrack === track ? chipActive : chipBase}
              >
                {track}
              </button>
            ))}

            <span className="mx-1 text-[#2a2a2a]">|</span>

            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                className={selectedDifficulty === d ? chipActive : chipBase}
              >
                {d}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#222222] bg-transparent px-2.5 py-1 text-xs text-[#7a7168] transition-all hover:text-[#e4ddd3]"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-2 text-sm text-[#7a7168]">No projects found.</p>
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
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {hasFilters && " for current filters"}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
