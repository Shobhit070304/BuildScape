import { ProjectsCatalogClient } from "@/components/ProjectsCatalogClient";
import { fetchProjectsFromDb } from "@/lib/projects";

export default async function ProjectsPage() {
  const projects = await fetchProjectsFromDb();
  return <ProjectsCatalogClient initialProjects={projects} />;
}
