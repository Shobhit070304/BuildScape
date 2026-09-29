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
  getProjectBySlug,
  getPhaseDescription,
  DIFFICULTY_COLORS,
  getTrackColor,
} from "@/lib/projects";
import { Navbar } from "@/components/Navbar";
import { ProjectEnrollmentBox } from "@/components/ProjectEnrollmentBox";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Overview`,
    description: project.tagline,
  };
}

export default async function ProjectOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const diffClass =
    DIFFICULTY_COLORS[project.difficulty] ??
    "text-amber-400 bg-amber-950/60 border-amber-900";
  const trackClass = getTrackColor(project.track);

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-[#0a0a0a] pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-[#7a7168]">
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

          {/* Project Header Banner */}
          <div className="mb-10 rounded-2xl border border-[#221f1a] bg-gradient-to-b from-[#14120f] to-[#0e0d0b] p-6 sm:p-10 shadow-lg">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${trackClass}`}
              >
                {project.track}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${diffClass}`}
              >
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#8a8178]">
                <Clock className="h-3.5 w-3.5 text-[#5c5449]" />
                {project.estimatedHours} hours estimated
              </span>
            </div>

            <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight text-[#e4ddd3] sm:text-4xl">
              {project.title}
            </h1>

            <p className="max-w-3xl text-sm leading-relaxed text-[#9e9587] sm:text-base mb-6">
              {project.tagline}
            </p>

            {/* Tech stack */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e1c18]">
              <span className="text-xs text-[#5c5449] mr-1">Technologies:</span>
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[#2a2620] bg-[#161411] px-2 py-0.5 text-xs text-[#c9a96e]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Main Grid: Left Curriculum, Right Enrollment Box */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: All Phases with Descriptions */}
            <div className="lg:col-span-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#e4ddd3]">
                    Curriculum & Phases
                  </h2>
                  <p className="text-xs text-[#7a7168] mt-1">
                    {project.phases.length} progressive phases taking you from zero to production deployment.
                  </p>
                </div>
              </div>

              {/* Phases List */}
              <div className="space-y-4">
                {project.phases.map((phase, idx) => {
                  const description = getPhaseDescription(phase);
                  return (
                    <Link
                      key={phase.id}
                      href={`/projects/${project.slug}/workspace?phase=${phase.id}`}
                      className="group relative block rounded-xl border border-[#221f1a] bg-[#11100e] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-700/50 hover:bg-[#151310] hover:shadow-lg hover:shadow-black/40"
                    >
                      <div className="flex items-start gap-4">
                        {/* Phase Number Badge */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-800/40 bg-amber-950/30 font-mono text-xs font-bold text-[#c9a96e] transition-colors group-hover:border-amber-600/60 group-hover:bg-amber-900/40 group-hover:text-amber-300">
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {/* Phase Details */}
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <h3 className="font-serif text-base font-semibold text-[#e4ddd3] transition-colors group-hover:text-[#d4b577]">
                              {phase.title}
                            </h3>
                            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#5c5449]">
                              Phase {idx + 1} of {project.phases.length}
                            </span>
                          </div>

                          {/* Phase Description */}
                          <p className="text-xs leading-relaxed text-[#8a8178] transition-colors group-hover:text-[#a89f91]">
                            {description}
                          </p>
                        </div>

                        {/* Open Phase Arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2a241c] bg-[#1a1713] text-[#c9a96e] group-hover:border-amber-700/50 group-hover:bg-amber-950/40">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* What you will ship notice */}
              <div className="mt-8 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-300">
                      Fully Working Deliverable
                    </h4>
                    <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">
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
