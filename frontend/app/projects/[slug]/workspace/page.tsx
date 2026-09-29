import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Clock, Layers, ArrowLeft } from "lucide-react";
import { getAllProjects, fetchProjectBySlugFromDb } from "@/lib/projects";
import { PhaseViewer } from "@/components/PhaseViewer";
import { TechBadge } from "@/components/TechBadge";
import { WorkspaceEnrollmentGuard } from "@/components/WorkspaceEnrollmentGuard";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ phase?: string }>;
}

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlugFromDb(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Workspace`,
    description: project.tagline,
  };
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-950/30 border-emerald-900/50",
  Intermediate: "text-amber-400 bg-amber-950/30 border-amber-800/50",
  Advanced: "text-rose-400 bg-rose-950/30 border-rose-900/50",
};

export default async function ProjectWorkspacePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { phase } = await searchParams;
  const project = await fetchProjectBySlugFromDb(slug);
  if (!project) notFound();

  const diffClass =
    DIFFICULTY_CLASSES[project.difficulty] ??
    "text-amber-400 bg-amber-950/30 border-amber-800/50";

  return (
    <WorkspaceEnrollmentGuard project={project}>
      <div className="flex h-dvh flex-col overflow-hidden">
        {/* Top breadcrumb bar */}
        <div className="flex h-11 shrink-0 items-center gap-3 overflow-hidden border-b border-[#1a1a1a] bg-[#0a0a0a] px-4">
          <Link
            href={`/projects/${project.slug}`}
            className="flex shrink-0 items-center gap-1 text-xs text-[#c9a96e] transition-colors hover:text-[#d4b577]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Project Overview
          </Link>

          <span className="h-3.5 w-px bg-[#2a2520]" />

          <Link
            href="/projects"
            className="hidden shrink-0 items-center gap-1 text-xs text-[#7a7168] transition-colors hover:text-[#e4ddd3] sm:flex"
          >
            All projects
          </Link>

          <span className="hidden h-3.5 w-px bg-[#2a2520] sm:block" />

          {/* Project meta */}
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <TechBadge name={project.track} size="xs" />
            <span
              className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[0.65rem] font-medium ${diffClass}`}
            >
              {project.difficulty}
            </span>
            <span className="truncate text-xs font-semibold text-[#e4ddd3]">
              {project.title}
            </span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-[#7a7168]">
            <Clock className="h-3 w-3" />
            {project.estimatedHours}h estimated
          </div>
        </div>

        {/* Phase viewer */}
        <div className="flex-1 overflow-hidden">
          <PhaseViewer project={project} initialPhaseId={phase} />
        </div>
      </div>
    </WorkspaceEnrollmentGuard>
  );
}
