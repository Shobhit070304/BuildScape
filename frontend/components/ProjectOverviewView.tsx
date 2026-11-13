"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Loader2,
  FolderX,
  Target,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectEnrollmentBox } from "@/components/ProjectEnrollmentBox";
import { CurriculumPhasesList } from "@/components/CurriculumPhasesList";
import { TechBadge } from "@/components/TechBadge";
import { MarkdownContent } from "@/components/MarkdownContent";
import { api } from "@/lib/api";
import { mapApiProject } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { useProgress } from "@/hooks/useProgress";

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
  const progress = useProgress(slug, Boolean(project));

  useEffect(() => {
    if (!initialProject) {
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
        <main className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="font-mono text-xs text-slate-400">Loading blueprint specifications...</p>
          </div>
        </main>
      </>
    );
  }

  if (notFound || !project) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center px-4">
          <div className="max-w-md text-center py-16">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-950/40">
              <FolderX className="h-7 w-7 text-indigo-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#F8FAFC] mb-2">Project Not Found</h1>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              The project &ldquo;{slug}&rdquo; could not be found in the curriculum database.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#141D2E] px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-indigo-500/50 hover:bg-[#1E293B]"
            >
              <ChevronLeft className="h-4 w-4" />
              Browse All Blueprints
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#050507] pb-24 pt-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <Link
              href="/projects"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Blueprints
            </Link>
            <span className="text-neutral-600">/</span>
            {project.category && (
              <>
                <span className="text-neutral-400">{project.category}</span>
                <span className="text-neutral-600">/</span>
              </>
            )}
            <span className="text-white truncate max-w-xs">{project.title}</span>
          </div>

          {/* Access Warning Banner if redirected from workspace */}
          {access && (
            <div className="mb-6 rounded-2xl border border-white/15 bg-[#0E0E14] p-4 text-xs text-neutral-200 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span>
                  {access === "login_required"
                    ? "You must sign in and enroll in this project to access the interactive workspace."
                    : "You must enroll in this project to access the phase-by-phase interactive workspace."}
                </span>
              </div>
              <span className="text-[0.7rem] text-white font-semibold">Please enroll below</span>
            </div>
          )}

          {/* Project Header Banner */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 sm:p-8 shadow-2xl shadow-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_70%)] before:pointer-events-none">
            <div className="relative flex flex-wrap items-center gap-2 mb-3.5">
              {project.category && (
                <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.625rem] font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  {project.category}
                </span>
              )}
              <TechBadge name={project.track} size="xs" />
              <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[0.68rem] font-medium text-neutral-300">
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 font-mono text-[0.72rem] text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                {project.estimatedHours} hours estimated
              </span>
            </div>

            <h1 className="relative mb-3 font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {project.title}
            </h1>

            <p className="relative max-w-3xl text-sm sm:text-base leading-relaxed text-neutral-300 mb-6">
              {project.tagline}
            </p>

            {/* Deliverable Callout */}
            {project.deliverable && (
              <div className="relative mb-6 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-xs text-neutral-200">
                <Target className="h-4 w-4 shrink-0 text-white mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Deliverable: </span>
                  <span className="text-neutral-300 leading-relaxed">{project.deliverable}</span>
                </div>
              </div>
            )}

            {/* Tech stack */}
            <div className="relative flex flex-wrap items-center gap-1.5 pt-4 border-t border-white/[0.08]">
              <span className="text-xs text-neutral-400 mr-1.5 font-mono font-medium">Stack:</span>
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} size="xs" showIcon={true} />
              ))}
            </div>
          </div>

          {/* Main Grid: Left Curriculum & Description, Right Enrollment Box */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Description, Prerequisites, What You Will Learn, and Roadmap */}
            <div className="lg:col-span-8 space-y-7">
              {/* Project Description (Markdown rendered) */}
              {project.description && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
                    <BookOpen className="h-4 w-4 text-white" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                      ARCHITECTURE & OVERVIEW
                    </h2>
                  </div>
                  <MarkdownContent className="text-sm">
                    {project.description}
                  </MarkdownContent>
                </div>
              )}

              {/* Prerequisites */}
              {project.prerequisites && project.prerequisites.length > 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 shadow-xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-white/[0.08]">
                    <Sparkles className="h-4 w-4 text-white" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                      PREREQUISITES
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {project.prerequisites.map((req, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                        <span className="leading-snug">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What You Will Learn */}
              {project.whatYouWillLearn && project.whatYouWillLearn.length > 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 shadow-xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-white/[0.08]">
                    <Award className="h-4 w-4 text-white" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                      KEY LEARNING OBJECTIVES
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {project.whatYouWillLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                        <CheckCircle className="h-4 w-4 shrink-0 text-white mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum Roadmap */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0E] p-6 sm:p-7 shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                <CurriculumPhasesList project={project} progress={progress} />
              </div>

              {/* Fully working deliverable notice */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-emerald-300">
                      Portfolio-Grade Production Deliverable
                    </h4>
                    <p className="text-xs text-emerald-300/80 mt-1 leading-relaxed">
                      {project.deliverable ||
                        `By completing all ${project.phases.length} phases, you will deploy a complete, fully functioning version of this system live on cloud infrastructure.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Enrollment Card (Sticky) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <ProjectEnrollmentBox project={project} progress={progress} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
