import type { Metadata } from "next";
import { fetchProjectBySlugFromDb } from "@/lib/projects";
import { ProjectOverviewView } from "@/components/ProjectOverviewView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
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
      return { title: `${formattedTitle} — BuildScape` };
    }
    return {
      title: `${project.title} — Overview`,
      description: project.tagline,
    };
  } catch {
    return { title: "Project Overview — BuildScape" };
  }
}

export default async function ProjectOverviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { access } = await searchParams;

  let project = null;
  try {
    project = await fetchProjectBySlugFromDb(slug);
  } catch (err) {
    console.warn(`Could not load project "${slug}" server-side:`, err);
  }

  return (
    <ProjectOverviewView
      initialProject={project ?? null}
      slug={slug}
      access={access}
    />
  );
}
