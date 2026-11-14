"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TechIcon } from "@/components/TechBadge";
import { api, type EnrolledProjectItem } from "@/lib/api";
import { mapApiProject, type Project } from "@/lib/projects";
import { TRACKS_DATA, type TrackMetadata } from "@/lib/tracks";
import { useAuth } from "@/context/AuthContext";

const CORE_TRACKS = Object.values(TRACKS_DATA);
const LEVELS_ORDER = ["Beginner", "Intermediate", "Advanced"] as const;

export default function RoadmapsPage() {
  const { user } = useAuth();
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>("golang");
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
      ? api
          .getEnrolledProjects()
          .then((data) => {
            if (!cancelled && data?.enrollments) {
              setEnrollments(data.enrollments);
            }
          })
          .catch(() => {})
      : Promise.resolve();

    Promise.all([projectPromise, enrollmentPromise]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const currentTrack: TrackMetadata =
    TRACKS_DATA[selectedTrackSlug] || TRACKS_DATA.golang;

  // Projects in selected track ordered by level
  const trackProjects = useMemo(() => {
    const list = projects.filter(
      (p) => p.track.toLowerCase() === currentTrack.name.toLowerCase()
    );
    return list.sort((a, b) => {
      const idxA = LEVELS_ORDER.indexOf(a.difficulty as (typeof LEVELS_ORDER)[number]);
      const idxB = LEVELS_ORDER.indexOf(b.difficulty as (typeof LEVELS_ORDER)[number]);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [projects, currentTrack]);

  // Map user progress to projects
  const enrollmentMap = useMemo(() => {
    const map = new Map<string, EnrolledProjectItem>();
    enrollments.forEach((e) => {
      map.set(e.project.slug, e);
    });
    return map;
  }, [enrollments]);

  // Track progress summary
  const completedInTrack = trackProjects.filter((p) => {
    const e = enrollmentMap.get(p.slug);
    return Boolean(e?.completedAt);
  }).length;

  const totalTrackHours = trackProjects.reduce((acc, p) => acc + (p.estimatedHours || 12), 0);

  return (
    <>
      <Navbar />
      <main className="w-full bg-[#050507] min-h-screen text-white pb-24 relative overflow-hidden">
        {/* Ambient atmospheric gradients */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(99,102,241,0.16),rgba(147,51,234,0.06)_40%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-5%] top-[30%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[120px]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 relative">
          {/* ───────────────── HEADER (LEFT-ALIGNED) ───────────────── */}
          <div className="mb-8 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              <Compass className="h-4 w-4" />
              <span>{"// GUIDED LEARNING PATHS"}</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Engineering Career Roadmaps
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Step-by-step sequential curricula connecting production systems from foundational API architecture to distributed high-concurrency engines.
            </p>
          </div>

          {/* ───────────────── TRACK SELECTOR PILLS ───────────────── */}
          <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CORE_TRACKS.map((t) => {
              const isActive = t.slug === selectedTrackSlug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setSelectedTrackSlug(t.slug)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white text-black shadow-md shadow-white/5 font-semibold"
                      : "bg-[#0A0A0E] text-neutral-400 border border-white/[0.08] hover:text-white hover:border-white/20"
                  }`}
                >
                  <TechIcon name={t.name} className="h-3.5 w-3.5" />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* ───────────────── ROADMAP CONTENT (LEFT-ALIGNED) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Progressive Timeline (8 Cols) */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              ) : trackProjects.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-8 text-center text-xs font-mono text-neutral-400">
                  Projects for {currentTrack.name} are currently being prepared.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500/50 before:to-transparent space-y-8">
                  {trackProjects.map((project, index) => {
                    const enrollment = enrollmentMap.get(project.slug);
                    const isCompleted = Boolean(enrollment?.completedAt);
                    const isInProgress = Boolean(enrollment && !enrollment.completedAt);

                    return (
                      <div key={project.id} className="relative group/node">
                        {/* Connecting Step Node Ring on Timeline */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-5 flex h-6 w-6 sm:h-8 sm:w-8 -translate-x-1/2 items-center justify-center rounded-full border text-xs font-mono font-bold transition-all ${
                            isCompleted
                              ? "border-emerald-400 bg-emerald-950 text-emerald-300 shadow-md shadow-emerald-500/20"
                              : isInProgress
                              ? "border-indigo-400 bg-indigo-950 text-indigo-300 ring-4 ring-indigo-500/20"
                              : "border-white/20 bg-[#0A0A0E] text-neutral-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        {/* Project Roadmap Card */}
                        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0C0D14] to-[#07070A] p-5 sm:p-6 shadow-xl transition-all duration-300 hover:border-white/20 hover:from-[#10121C] hover:to-[#0A0A0F]">
                          {/* Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                STAGE {index + 1} · {project.difficulty.toUpperCase()}
                              </span>
                              {isCompleted && (
                                <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 font-mono text-[9px] text-emerald-300">
                                  Shipped &amp; Verified
                                </span>
                              )}
                              {isInProgress && (
                                <span className="rounded bg-indigo-950/60 border border-indigo-500/30 px-1.5 py-0.2 font-mono text-[9px] text-indigo-300">
                                  In Progress (Phase {(enrollment?.currentPhaseIndex || 0) + 1})
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-[11px] text-neutral-500">
                              ~{project.estimatedHours || 12}h estimated
                            </span>
                          </div>

                          <h3 className="font-sans text-base sm:text-lg font-bold text-white mb-2">
                            {project.title}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed mb-4">
                            {project.tagline || project.description}
                          </p>

                          {/* Tech Stack Pills in Small Font */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-5">
                            {project.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                            <span className="font-mono text-[11px] text-neutral-500">
                              {project.phases?.length || 5} Milestone Phases
                            </span>

                            <Link
                              href={
                                isInProgress
                                  ? `/projects/${project.slug}/workspace`
                                  : `/projects/${project.slug}`
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors"
                            >
                              <span>
                                {isCompleted
                                  ? "Review Architecture"
                                  : isInProgress
                                  ? "Continue Workspace"
                                  : "Start Stage"}
                              </span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side: Track Overview & Curriculum Notes (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              {/* Progress Summary Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 shadow-lg space-y-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  YOUR TRACK PROGRESS
                </span>

                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-2xl font-bold text-white">
                    {completedInTrack} of {trackProjects.length}
                  </span>
                  <span className="text-xs text-emerald-400">
                    {trackProjects.length > 0
                      ? `${Math.round((completedInTrack / trackProjects.length) * 100)}% Complete`
                      : "0%"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${
                        trackProjects.length > 0
                          ? (completedInTrack / trackProjects.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-[11px] text-neutral-400">
                  Total curriculum commitment: ~{totalTrackHours} hours
                </div>
              </div>

              {/* Dedicated Track Link Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <TechIcon name={currentTrack.name} className="h-4 w-4" />
                  <span className="font-sans font-bold text-xs text-white">
                    {currentTrack.name} Track Guide
                  </span>
                </div>
                <p className="text-[11px] font-sans text-neutral-300 leading-relaxed">
                  {currentTrack.shortDescription}
                </p>
                <Link
                  href={`/tracks/${currentTrack.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-1"
                >
                  <span>Open Dedicated Track Hub</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
