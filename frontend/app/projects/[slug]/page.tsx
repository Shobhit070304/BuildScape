import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle,
  FileCode2,
} from "lucide-react";
import {
  getAllProjects,
  fetchProjectBySlugFromDb,
  DIFFICULTY_COLORS,
} from "@/lib/projects";
import { Navbar } from "@/components/Navbar";
import { ProjectEnrollmentBox } from "@/components/ProjectEnrollmentBox";
import { CurriculumPhasesList } from "@/components/CurriculumPhasesList";
import { TechBadge } from "@/components/TechBadge";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
}

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlugFromDb(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Overview`,
    description: project.tagline,
  };
}

export default async function ProjectOverviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { access } = await searchParams;
  const project = await fetchProjectBySlugFromDb(slug);
  if (!project) notFound();

  const diffClass =
    DIFFICULTY_COLORS[project.difficulty] ??
    "text-amber-400 bg-amber-950/60 border-amber-900";

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#0a0a0a] pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-[#7a7168]">
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

          {/* Project Header Banner (Sleeker and tighter) */}
          <div className="mb-8 rounded-2xl border border-[#221f1a] bg-gradient-to-b from-[#14120f] to-[#0e0d0b] p-5 sm:p-8 shadow-lg">
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              <TechBadge name={project.track} size="xs" />
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[0.68rem] font-medium ${diffClass}`}
              >
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[0.72rem] text-[#8a8178]">
                <Clock className="h-3 w-3 text-[#5c5449]" />
                {project.estimatedHours} hours estimated
              </span>
            </div>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#e4ddd3] sm:text-3xl">
              {project.title}
            </h1>

            <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-[#9e9587] mb-5">
              {project.tagline}
            </p>

            {/* Tech stack */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#1e1c18]">
              <span className="text-[0.72rem] text-[#5c5449] mr-1">Technologies:</span>
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} size="xs" showIcon={true} />
              ))}
            </div>
          </div>

          {/* Main Grid: Left Curriculum, Right Enrollment Box */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: All Phases with Descriptions */}
            <div className="lg:col-span-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#e4ddd3]">
                    Curriculum & Phases
                  </h2>
                  <p className="text-xs text-[#7a7168] mt-0.5">
                    {project.phases.length} progressive phases taking you from zero to production deployment.
                  </p>
                </div>
              </div>

              {/* Locked / Enrolled Interactive Phases List */}
              <CurriculumPhasesList project={project} />

              {/* What you will ship notice */}
              <div className="mt-8 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-emerald-300">
                      Fully Working Deliverable
                    </h4>
                    <p className="text-xs text-emerald-400/80 mt-0.5 leading-relaxed">
                      By completing all {project.phases.length} phases, you will deploy a complete, fully functioning version of this application live on the web to showcase in your developer portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Enrollment Card (Sticky) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <ProjectEnrollmentBox project={project} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
