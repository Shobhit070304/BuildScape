"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Layers,
  Users,
  Clock,
  ArrowRight,
  Terminal,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TechIcon } from "@/components/TechBadge";
import { ProjectCard } from "@/components/ProjectCard";
import { api, type EnrolledProjectItem } from "@/lib/api";
import { mapApiProject, type Project } from "@/lib/projects";
import { getTrackBySlug, TRACKS_DATA } from "@/lib/tracks";
import { useAuth } from "@/context/AuthContext";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function DedicatedTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const resolvedParams = use(params);
  const trackSlug = resolvedParams.track.toLowerCase();
  const trackMeta = getTrackBySlug(trackSlug);

  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [enrollments, setEnrollments] = useState<EnrolledProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const projectPromise = api.getProjects().then((data) => {
      if (!cancelled && data?.projects) {
        setProjects(data.projects.map(mapApiProject));
      }
    });

    const enrollmentPromise = user
      ? api.getEnrolledProjects().then((data) => {
          if (!cancelled && data?.enrollments) {
            setEnrollments(data.enrollments);
          }
        }).catch(() => {})
      : Promise.resolve();

    Promise.all([projectPromise, enrollmentPromise]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!trackMeta) {
    notFound();
  }

  // Filter projects for this track
  const trackProjects = useMemo(() => {
    return projects.filter(
      (p) => p.track.toLowerCase() === trackMeta.name.toLowerCase()
    );
  }, [projects, trackMeta]);

  // Aggregate track stats
  const totalProjects = trackProjects.length;
  const totalLearners = trackProjects.reduce(
    (acc, p) => acc + (typeof p.learnerCount === "number" ? p.learnerCount : 0),
    0
  );
  const totalPhases = trackProjects.reduce(
    (acc, p) => acc + (p.phases?.length || 5),
    0
  );

  // User running projects in this track
  const runningProjects = useMemo(() => {
    return enrollments.filter(
      (e) =>
        e.project.track.toLowerCase() === trackMeta.name.toLowerCase() &&
        !e.completedAt
    );
  }, [enrollments, trackMeta]);

  return (
    <>
      <Navbar />
      <main className="w-full bg-[#050507] min-h-screen text-white pb-24 relative overflow-hidden">
        {/* Ambient atmospheric gradients */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[450px] w-full bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(99,102,241,0.15),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-10%] top-[30%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[100px]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 relative">
          {/* Back Navigation Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* ───────────────── TRACK HEADER (LEFT-ALIGNED) ───────────────── */}
          <div className="mb-10 pb-8 border-b border-white/[0.08]">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white shadow-md">
                <TechIcon name={trackMeta.name} className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
                    ENGINEERING TRACK
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">·</span>
                  <span className="font-mono text-[10px] text-neutral-400">Production Systems</span>
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                  {trackMeta.name} Architecture
                </h1>
              </div>
            </div>

            {/* 20-30 Word Track Description */}
            <p className="text-xs sm:text-[13px] text-neutral-300 max-w-2xl leading-relaxed mb-5">
              {trackMeta.shortDescription}
            </p>

            {/* Stats row in small font size */}
            <div className="flex flex-wrap items-center gap-5 font-mono text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-neutral-500" />
                <span>
                  <strong className="text-white font-semibold">{totalProjects}</strong> Projects
                </span>
              </div>
              <span className="text-neutral-700">·</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-neutral-500" />
                <span>
                  <strong className="text-white font-semibold">
                    {totalLearners > 0 ? totalLearners.toLocaleString() : "Real"}
                  </strong> Active Builders
                </span>
              </div>
              <span className="text-neutral-700">·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>
                  <strong className="text-white font-semibold">{totalPhases}</strong> Milestone Phases
                </span>
              </div>
            </div>
          </div>

          {/* ───────────────── TWO-COLUMN WORKSPACE: PROJECTS + HELPFUL SIDE BOX ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Running Projects & Level Breakdown */}
            <div className="lg:col-span-8 space-y-10">
              {/* User Running Projects in This Stack */}
              {runningProjects.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/[0.06]">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      YOUR ACTIVE BUILDS IN {trackMeta.name.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {runningProjects.length} in progress
                    </span>
                  </div>

                  <div className="space-y-2">
                    {runningProjects.map((item) => (
                      <Link
                        key={item.enrollmentId}
                        href={`/projects/${item.project.slug}/workspace`}
                        className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-3.5 transition-all hover:border-white/20 hover:bg-[#0E0E14]"
                      >
                        <div className="min-w-0 pr-3">
                          <h3 className="font-sans text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 truncate">
                            {item.project.title}
                          </h3>
                          <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                            Phase {item.currentPhaseIndex + 1} of {item.totalPhases || 5} · {item.completedCount} completed
                          </p>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400 group-hover:text-emerald-300 shrink-0">
                          <span>Continue</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Grouped by Level (Beginner -> Intermediate -> Advanced) */}
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : (
                LEVELS.map((level) => {
                  const levelProjects = trackProjects.filter(
                    (p) => p.difficulty.toLowerCase() === level.toLowerCase()
                  );

                  return (
                    <section key={level} className="space-y-3">
                      {/* Level Heading */}
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white tracking-wide">
                            {level.toUpperCase()}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500">
                            ({levelProjects.length})
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {level === "Beginner"
                            ? "Core fundamentals & architecture setup"
                            : level === "Intermediate"
                            ? "Concurrency, persistence & caching"
                            : "Distributed scaling & fault tolerance"}
                        </span>
                      </div>

                      {/* Projects under this level with a small horizontal separator line */}
                      {levelProjects.length === 0 ? (
                        <p className="font-mono text-[11px] text-neutral-500 py-2">
                          Upcoming {level.toLowerCase()} systems in development.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {levelProjects.map((proj, idx) => (
                            <div key={proj.id}>
                              <ProjectCard project={proj} />
                              {idx < levelProjects.length - 1 && (
                                <div className="h-[1px] w-full bg-white/[0.04] my-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>

            {/* Right 4 Cols: "Small box with info that will be helpful to user" */}
            <div className="lg:col-span-4 space-y-4">
              {/* Helpful Track Guide Box */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 shadow-lg space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span className="font-sans font-bold text-xs text-white">
                    {trackMeta.name} Builder Guide
                  </span>
                </div>

                {/* Recommended Tooling */}
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1.5">
                    RECOMMENDED TOOLING
                  </span>
                  <div className="space-y-1">
                    {trackMeta.helpfulInfo.recommendedTooling.map((tool) => (
                      <div key={tool} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                        <span className="h-1 w-1 rounded-full bg-indigo-400 shrink-0" />
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Libraries */}
                <div className="border-t border-white/[0.06] pt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1.5">
                    CORE ECOSYSTEM LIBRARIES
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {trackMeta.helpfulInfo.coreLibraries.map((lib) => (
                      <span
                        key={lib}
                        className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-neutral-300 border border-white/[0.04]"
                      >
                        {lib}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Patterns */}
                <div className="border-t border-white/[0.06] pt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1.5">
                    ARCHITECTURE PATTERNS
                  </span>
                  <div className="space-y-1">
                    {trackMeta.helpfulInfo.keyPatterns.map((pat) => (
                      <div key={pat} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{pat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Pro Tip Box */}
                <div className="border-t border-white/[0.06] pt-3">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                    ENGINEERING TIP
                  </span>
                  <p className="text-[11px] font-sans text-neutral-300 leading-relaxed italic">
                    &ldquo;{trackMeta.helpfulInfo.quickTip}&rdquo;
                  </p>
                </div>
              </div>

              {/* Other Tracks Quick Switcher */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-4 font-mono text-xs space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  EXPLORE OTHER TRACKS
                </span>
                <div className="flex flex-col gap-1">
                  {Object.values(TRACKS_DATA)
                    .filter((t) => t.slug !== trackMeta.slug)
                    .map((t) => (
                      <Link
                        key={t.slug}
                        href={`/tracks/${t.slug}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <TechIcon name={t.name} className="h-3.5 w-3.5" />
                          <span className="text-[11px]">{t.name}</span>
                        </div>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
