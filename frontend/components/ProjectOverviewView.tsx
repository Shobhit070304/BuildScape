"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Loader2,
  FolderX,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectEnrollmentBox } from "@/components/ProjectEnrollmentBox";
import { CurriculumPhasesList } from "@/components/CurriculumPhasesList";
import { TechBadge } from "@/components/TechBadge";
import { api } from "@/lib/api";
import { DIFFICULTY_COLORS, mapApiProject } from "@/lib/projects";
import type { Project } from "@/lib/projects";

interface ProjectOverviewViewProps {
  initialProject: Project | null;
  slug: string;
  access?: string;
}

export function ProjectOverviewView({
  initialProject,
  slug,
  access,
}: ProjectOverviewViewProps) {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [loading, setLoading] = useState(!initialProject);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!initialProject) {
      setLoading(true);
      api
        .getProject(slug)
        .then((data) => {
          if (data?.project) {
            setProject(mapApiProject(data.project));
          } else {
            setNotFound(true);
          }
        })
        .catch((err) => {
          console.error("Could not fetch project client-side:", err);
          setNotFound(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialProject, slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="font-mono text-xs text-text-muted">Loading project details from database...</p>
          </div>
        </main>
      </>
    );
  }

  if (notFound || !project) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-4">
          <div className="max-w-md text-center py-16">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-800/40 bg-amber-950/30">
              <FolderX className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-text mb-2">Project Not Found</h1>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              The project &ldquo;{slug}&rdquo; could not be found in the curriculum database.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#14120f] px-4 py-2 text-xs font-medium text-text transition-colors hover:border-border-hover hover:bg-[#1c1915]"
            >
              <ChevronLeft className="h-4 w-4" />
              Browse All Projects
            </Link>
          </div>
        </main>
      </>
    );
  }

  const diffClass =
    DIFFICULTY_COLORS[project.difficulty] ??
    "text-amber-400 bg-amber-950/60 border-amber-900";

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#0a0a0a] pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-text-muted">
            <Link
              href="/projects"
              className="flex items-center gap-1 transition-colors hover:text-[#e4ddd3]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              All Projects
            </Link>
            <span className="text-[#3a3530]">/</span>
            <span className="text-[#a89f91] truncate max-w-xs">{project.title}</span>
          </div>

          {/* Access Warning Banner if redirected from workspace */}
          {access && (
            <div className="mb-6 rounded-xl border border-amber-600/50 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span>
                  {access === "login_required"
                    ? "You must sign in and enroll in this project to access the interactive workspace."
                    : "You must enroll in this project to access the phase-by-phase interactive workspace."}
                </span>
              </div>
              <span className="text-[0.7rem] text-amber-400 font-medium">Please enroll below</span>
            </div>
          )}

          {/* Project Header Banner */}
          <div className="mb-6 rounded-xl border border-zinc-800 bg-[#0e0e0e] p-4 sm:p-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <TechBadge name={project.track} size="xs" />
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[0.68rem] font-medium ${diffClass}`}
              >
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[0.72rem] text-zinc-400">
                <Clock className="h-3 w-3 text-zinc-500" />
                {project.estimatedHours} hours estimated
              </span>
            </div>

            <h1 className="mb-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text">
              {project.title}
            </h1>

            <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-[#a0978c] mb-4">
              {project.tagline}
            </p>

            {/* Tech stack */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-800/80">
              <span className="text-[0.72rem] text-[#6b6256] mr-1">Stack:</span>
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} size="xs" showIcon={true} />
              ))}
            </div>
          </div>

          {/* Main Grid: Left Curriculum & Description, Right Enrollment Box */}
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
            {/* Left Column: Description, What You Will Learn, and Roadmap */}
            <div className="lg:col-span-8 space-y-6">
              {/* Project Description */}
              {project.description && (
                <div className="rounded-xl border border-[#221f1a] bg-[#100e0c] p-4 sm:p-5">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent mb-2 font-semibold">
                    PROJECT OVERVIEW
                  </h3>
                  <p className="text-xs sm:text-sm text-[#c4bbb0] leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* What You Will Learn */}
              {project.whatYouWillLearn && project.whatYouWillLearn.length > 0 && (
                <div className="rounded-xl border border-[#221f1a] bg-[#100e0c] p-4 sm:p-5">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent mb-3 font-semibold">
                    WHAT YOU WILL LEARN
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {project.whatYouWillLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#c4bbb0]">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-accent mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked / Enrolled Interactive Roadmap */}
              <div className="rounded-xl border border-zinc-800/80 bg-[#0d0d0d] p-4 sm:p-6">
                <CurriculumPhasesList project={project} />
              </div>

              {/* Fully working deliverable notice */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-emerald-300">
                      Production Deliverable
                    </h4>
                    <p className="text-xs text-emerald-400/80 mt-0.5 leading-relaxed">
                      By completing all {project.phases.length} phases, you will deploy a complete, fully functioning version of this system live on cloud infrastructure to showcase in your portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Enrollment Card (Sticky) */}
            <div className="lg:col-span-4">
              <div className="sticky top-16">
                <ProjectEnrollmentBox project={project} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
