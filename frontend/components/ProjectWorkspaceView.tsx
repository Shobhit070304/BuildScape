"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Loader2, FolderX, ChevronLeft } from "lucide-react";
import { PhaseViewer } from "@/components/PhaseViewer";
import { TechBadge } from "@/components/TechBadge";
import { WorkspaceEnrollmentGuard } from "@/components/WorkspaceEnrollmentGuard";
import { api } from "@/lib/api";
import { mapApiProject } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const DIFFICULTY_CLASSES: Record<string, string> = {
  Entry: "text-sky-400 bg-sky-950/30 border-sky-900/50",
  Basic: "text-emerald-400 bg-emerald-950/30 border-emerald-900/50",
  Intermediate: "text-amber-400 bg-amber-950/30 border-amber-800/50",
  Advanced: "text-rose-400 bg-rose-950/30 border-rose-900/50",
  Expert: "text-purple-400 bg-purple-950/30 border-purple-900/50",
};

interface ProjectWorkspaceViewProps {
  initialProject: Project | null;
  slug: string;
  initialPhaseId?: string;
}

export function ProjectWorkspaceView({
  initialProject,
  slug,
  initialPhaseId,
}: ProjectWorkspaceViewProps) {
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
          console.error("Could not fetch workspace project client-side:", err);
          setNotFound(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialProject, slug]);

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="font-mono text-xs text-text-muted">Loading workspace environment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0a] px-4">
        <div className="max-w-md text-center py-16">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-800/40 bg-amber-950/30">
            <FolderX className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text mb-2">Project Not Found</h1>
          <p className="text-xs text-text-muted leading-relaxed mb-6">
            The workspace for &ldquo;{slug}&rdquo; could not be loaded from the database.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#14120f] px-4 py-2 text-xs font-medium text-text transition-colors hover:border-border-hover hover:bg-[#1c1915]"
          >
            <ChevronLeft className="h-4 w-4" />
            Browse All Projects
          </Link>
        </div>
      </div>
    );
  }

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
            className="flex shrink-0 items-center gap-1 text-xs text-accent transition-colors hover:text-accent-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Project Overview
          </Link>

          <span className="h-3.5 w-px bg-[#2a2520]" />

          <Link
            href="/projects"
            className="hidden shrink-0 items-center gap-1 text-xs text-text-muted transition-colors hover:text-[#e4ddd3] sm:flex"
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

          <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
            <Clock className="h-3 w-3" />
            {project.estimatedHours}h estimated
          </div>
        </div>

        {/* Phase viewer */}
        <div className="flex-1 overflow-hidden">
          <PhaseViewer project={project} initialPhaseId={initialPhaseId} />
        </div>
      </div>
    </WorkspaceEnrollmentGuard>
  );
}
