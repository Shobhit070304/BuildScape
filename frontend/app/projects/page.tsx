"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllTracks, mapApiProject } from "@/lib/projects";
import { api } from "@/lib/api";
import type { Project } from "@/lib/projects";

// Track brand icons matching Image 1
function renderTrackIcon(track: string) {
  switch (track) {
    case "Web Development":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#e34f26] text-[9px] font-black text-white">
          5
        </span>
      );
    case "Full-Stack SpringBoot":
    case "Spring Boot":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#6db33f]/25 text-[#6db33f]">
          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
            <path d="M21.5 13.5c-1.5 5.5-6.5 9-12 7.5S.5 14.5 2 9s6.5-9 12-7.5c2.5.7 4.7 2.2 6.2 4.3l-3.2 2.3c-1.1-1.4-2.6-2.3-4.3-2.7-4-.9-7.9 1.6-8.9 5.6s1.6 7.9 5.6 8.9c3.4.8 6.9-1 8.2-4.2l3.9 2.1z" />
          </svg>
        </span>
      );
    case "Machine Learning":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
          <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <circle cx="5" cy="8" r="2" />
            <circle cx="19" cy="8" r="2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </span>
      );
    case "React & Node.js":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#61dafb]">
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(30 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(90 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(150 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        </span>
      );
    case "C++":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00599c] text-[8px] font-bold text-white">
          C+
        </span>
      );
    case "Python":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-amber-400">
          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 6.5 4.5 6.5 4.5V7h5.5v1H5s-3 0-3 5.5 2.5 5.5 2.5 5.5h1.5v-2.5c0-1.5 1.5-1.5 1.5-1.5h5.5c1.5 0 1.5-1.5 1.5-1.5V7c0-2-2.5-5-6-5zm-1.5 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm1.5 18c5.5 0 5.5-2.5 5.5-2.5V17H12v-1h7s3 0 3-5.5-2.5-5.5-2.5-5.5h-1.5v2.5c0 1.5-1.5 1.5-1.5 1.5H11c-1.5 0-1.5 1.5-1.5 1.5V17c0 2 2.5 5 6 5zm1.5-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
        </span>
      );
    case "Ethereum dApps":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
          <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
            <polygon points="12 2 4 13 12 17 20 13 12 2" />
            <polygon points="12 18 4 14 12 22 20 14 12 18" />
          </svg>
        </span>
      );
    case "Rust":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-800 text-stone-200 text-[9px] font-bold">
          ⚙
        </span>
      );
    case "Golang":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#00add8] text-[8px] font-black text-white">
          GO
        </span>
      );
    case "Java":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-rose-400">
          ☕
        </span>
      );
    case "C Language":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#00599c]/90 text-[8px] font-bold text-white">
          C
        </span>
      );
    case "Next.js":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[8px] font-bold text-black">
          N
        </span>
      );
    case "C#":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#9b4993] text-[7px] font-bold text-white">
          C#
        </span>
      );
    case "Node.js":
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-emerald-400 text-[9px] font-bold">
          ⬢
        </span>
      );
    default:
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400 text-[10px]">
          ✦
        </span>
      );
  }
}

const ALL_PRIMARY_TRACKS = [
  "Web Development",
  "Full-Stack SpringBoot",
  "Machine Learning",
  "React & Node.js",
  "C++",
  "Python",
  "Ethereum dApps",
  "Rust",
  "Golang",
  "Java",
  "C Language",
  "Next.js",
  "C#",
];

const LEVEL_OPTIONS = [
  { label: "Entry", difficulty: "Entry" },
  { label: "Basic", difficulty: "Basic" },
  { label: "Intermediate", difficulty: "Intermediate" },
  { label: "Advanced", difficulty: "Advanced" },
  { label: "Expert", difficulty: "Expert" },
];

const COMING_SOON_TRACKS: Record<
  string,
  { desc: string; builds: string[]; quarter: string }
> = {
  "Web Development": {
    desc: "Modern frontend mastery with responsive layout systems, animation engines, and production web standards.",
    builds: [
      "E-Commerce Storefront with Next.js & Stripe Checkout",
      "Interactive Canvas Graphics & 2D Physics Engine",
    ],
    quarter: "Q4 2026",
  },
  "Machine Learning": {
    desc: "From training neural networks to production inferencing, vector search, and distributed model pipelines.",
    builds: [
      "Transformer Attention Architecture from Scratch in PyTorch",
      "Production MLOps Feature Store & Latency Benchmarker",
    ],
    quarter: "Q4 2026",
  },
  "React & Node.js": {
    desc: "Full-stack single-page application development with modern React hooks, server streaming, and Express microservices.",
    builds: [
      "Real-Time Collaborative Canvas (Figma Lite) with WebSockets",
      "High-Throughput GraphQL Subscriptions Gateway",
    ],
    quarter: "Q4 2026",
  },
  "C++": {
    desc: "High-performance systems programming, memory safety management, and game runtime foundations.",
    builds: [
      "High-Performance 2D Game Physics Engine with SIMD",
      "Thread-Safe Lock-Free Memory Allocator & Pool",
    ],
    quarter: "Q1 2027",
  },
  "Ethereum dApps": {
    desc: "Decentralized finance protocols, smart contract security, and Web3 EVM applications.",
    builds: [
      "Decentralized Liquidity Pool & Automated Market Maker (AMM)",
      "ERC-721 NFT Minting Engine with Merkle Proofs",
    ],
    quarter: "Q1 2027",
  },
  Java: {
    desc: "Enterprise core systems with Jakarta EE, multithreading, and reactive streams.",
    builds: [
      "Distributed Banking Ledger with Jakarta EE & Kafka",
      "Reactive Microservice Mesh with Quarkus",
    ],
    quarter: "Q4 2026",
  },
  "C Language": {
    desc: "Low-level computer architecture, operating system interfaces, and bare-metal programming.",
    builds: [
      "Linux Shell & Process Manager with Signals from Scratch",
      "Lightweight Embedded RTOS Kernel & Task Scheduler",
    ],
    quarter: "Q1 2027",
  },
  "C#": {
    desc: "Modern cross-platform .NET 9 backends, cloud APIs, and game development.",
    builds: [
      "High-Throughput ASP.NET Core 9 Microservices Platform",
      "Cross-Platform 2D Game Engine in C#",
    ],
    quarter: "Q1 2027",
  },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFromDb, setIsFromDb] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedLevelLabel, setSelectedLevelLabel] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [notifiedTracks, setNotifiedTracks] = useState<string[]>([]);

  // Fetch dynamic projects from DB API on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getProjects()
      .then((data) => {
        if (isMounted && data?.projects && data.projects.length > 0) {
          setProjects(data.projects.map(mapApiProject));
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
      const matchTrack =
        !selectedTrack ||
        p.track.toLowerCase().includes(selectedTrack.toLowerCase()) ||
        selectedTrack.toLowerCase().includes(p.track.toLowerCase()) ||
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

  // Slice tracks for Image 1 toggle
  const visibleTracks = isExpanded ? ALL_PRIMARY_TRACKS : ALL_PRIMARY_TRACKS.slice(0, 9);

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
                  className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                    selectedTrack === null
                      ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                      : "bg-[#14120f] text-[#8a8178] border border-[#24211b] hover:text-[#e4ddd3] hover:border-[#38332a]"
                  }`}
                >
                  All
                </button>

                {/* Track Pills with brand icons */}
                {visibleTracks.map((track) => {
                  const isSelected = selectedTrack === track;
                  return (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(isSelected ? null : track)}
                      className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-950/70 text-[#ecd39e] border border-amber-600/70 shadow-xs"
                          : "bg-[#14120f] text-[#c4bbb0] border border-[#24211b] hover:border-[#38332a] hover:text-white"
                      }`}
                    >
                      {renderTrackIcon(track)}
                      <span>{track}</span>
                    </button>
                  );
                })}

                {/* ^ Less / v More button */}
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#8a8178] border border-[#24211b] bg-[#14120f] hover:text-[#e4ddd3] hover:border-[#38332a] transition-all cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      <span>Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      <span>More</span>
                    </>
                  )}
                </button>
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
                  className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                    selectedLevelLabel === null
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
                      className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                        isSelected
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

          {/* Results Grid or Coming Soon Component */}
          {filtered.length === 0 ? (
            selectedTrack && COMING_SOON_TRACKS[selectedTrack] ? (
              <div className="rounded-2xl border border-amber-900/40 bg-linear-to-b from-[#18130e] via-[#100e0c] to-[#0a0a0a] p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24211b] pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-700/50 bg-amber-950/50 shadow-md">
                      {renderTrackIcon(selectedTrack)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-base sm:text-lg font-bold text-[#f0eae1]">
                          {selectedTrack} Curriculum
                        </h2>
                        <span className="inline-flex items-center rounded-full border border-amber-700/50 bg-amber-950/50 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                          ✦ In Active Development
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8178] mt-0.5">
                        {COMING_SOON_TRACKS[selectedTrack].desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-muted">
                      Target: {COMING_SOON_TRACKS[selectedTrack].quarter}
                    </span>
                  </div>
                </div>

                {/* Planned Builds Roadmap Preview */}
                <div className="mb-6">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent mb-3">
                    Upcoming Production Builds In This Track
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {COMING_SOON_TRACKS[selectedTrack].builds.map(
                      (buildTitle, idx) => (
                        <div
                          key={buildTitle}
                          className="flex items-start gap-3 rounded-xl border border-[#221f1a] bg-[#12100d] p-3.5"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#2e2a24] bg-[#181613] font-mono text-[10px] font-bold text-[#a0978c]">
                            0{idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-[#e4ddd3]">
                              {buildTitle}
                            </h4>
                            <span className="mt-1 inline-block text-[10px] font-mono text-accent">
                              Phase breakdown &amp; blueprints in progress
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!notifiedTracks.includes(selectedTrack)) {
                        setNotifiedTracks([...notifiedTracks, selectedTrack]);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      notifiedTracks.includes(selectedTrack)
                        ? "bg-emerald-950 border border-emerald-700 text-emerald-300"
                        : "bg-linear-to-r from-amber-700 to-amber-600 text-stone-950 border border-amber-500/50 hover:brightness-105"
                    }`}
                  >
                    <span>
                      {notifiedTracks.includes(selectedTrack)
                        ? "✓ You're on the Early Access List"
                        : "🔔 Notify Me When Track Drops"}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="rounded-lg border border-[#262420] bg-[#14120f] px-4 py-2 text-xs font-medium text-[#a0978c] hover:text-[#e4ddd3] hover:border-[#3a352c] transition-all cursor-pointer"
                  >
                    Browse Live Tracks (Spring Boot, Go, Rust, Next.js, Python, Node)
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center rounded-xl border border-dashed border-[#24211b] bg-[#0e0d0b]">
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
            )
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
