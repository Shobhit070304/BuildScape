import { ProjectsCatalogClient } from "@/components/ProjectsCatalogClient";
import { fetchProjectsFromDb } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await fetchProjectsFromDb();
  return <ProjectsCatalogClient initialProjects={projects} />;
}
