import type { Metadata } from "next";
import { fetchProjectBySlugFromDb } from "@/lib/projects";
import { ProjectWorkspaceView } from "@/components/ProjectWorkspaceView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ phase?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await fetchProjectBySlugFromDb(slug);
    if (!project) {
      const formattedTitle = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return { title: `${formattedTitle} Workspace — BuildScape` };
    }
    return {
      title: `${project.title} — Workspace`,
      description: project.tagline,
    };
  } catch {
    return { title: "Workspace — BuildScape" };
  }
}

export default async function ProjectWorkspacePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { phase } = await searchParams;

  let project = null;
  try {
    project = await fetchProjectBySlugFromDb(slug);
  } catch (err) {
    console.warn(`Could not load workspace project "${slug}" server-side:`, err);
  }

  return (
    <ProjectWorkspaceView
      initialProject={project ?? null}
      slug={slug}
      initialPhaseId={phase}
    />
  );
}
