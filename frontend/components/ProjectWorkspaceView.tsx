"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Loader2, FolderX, ChevronLeft, Target } from "lucide-react";
import { PhaseViewer } from "@/components/PhaseViewer";
import { WorkspaceEnrollmentGuard } from "@/components/WorkspaceEnrollmentGuard";
import { api } from "@/lib/api";
import { mapApiProject } from "@/lib/projects";
import type { Project } from "@/lib/projects";

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
      <div className="flex h-dvh w-full items-center justify-center bg-[#050507]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="font-mono text-xs text-neutral-400">Loading workspace environment...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#050507] px-4">
        <div className="max-w-md text-center py-16">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <FolderX className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-white mb-2">Project Not Found</h1>
          <p className="text-xs text-neutral-400 leading-relaxed mb-6">
            The workspace for &ldquo;{slug}&rdquo; could not be loaded from the database.
          </p>
          <Link
            href="/projects"
            className="btn-secondary px-4 py-2 text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Browse All Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceEnrollmentGuard project={project}>
      {(progress) => (
        <div className="flex h-dvh flex-col overflow-hidden bg-[#050507]">
          {/* Top Navigation Bar */}
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0A0A0E] px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                href={`/projects/${project.slug}`}
                className="flex shrink-0 items-center gap-1 font-semibold text-xs text-white transition-opacity hover:opacity-80"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Project</span> Overview
              </Link>

              <span className="h-3.5 w-px bg-white/10" />

              <Link
                href="/projects"
                className="hidden shrink-0 items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-white md:flex"
              >
                All Projects
              </Link>

              <span className="hidden h-3.5 w-px bg-white/10 md:block" />

              {/* Project Title */}
              <span className="truncate text-xs font-semibold text-neutral-200">
                {project.title}
              </span>
            </div>

            {/* Right Meta Info */}
            <div className="flex shrink-0 items-center gap-3">
              {project.deliverable && (
                <div
                  className="hidden xl:flex items-center gap-1 text-[0.6875rem] text-neutral-300 max-w-xs truncate"
                  title={project.deliverable}
                >
                  <Target className="h-3 w-3 shrink-0 text-white" />
                  <span className="truncate">{project.deliverable}</span>
                </div>
              )}

              <div className="flex shrink-0 items-center gap-1 font-mono text-[0.6875rem] text-neutral-400">
                <Clock className="h-3 w-3 text-neutral-500" />
                <span>{project.estimatedHours}h</span>
              </div>
            </div>
          </header>

          {/* Phase viewer */}
          <div className="flex-1 overflow-hidden">
            <PhaseViewer project={project} initialPhaseId={initialPhaseId} progress={progress} />
          </div>
        </div>
      )}
    </WorkspaceEnrollmentGuard>
  );
}
