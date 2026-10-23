import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { fetchProjectsFromDb } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  let projectSlugs: string[] = [];
  try {
    const projects = await fetchProjectsFromDb();
    if (projects && projects.length > 0) {
      projectSlugs = projects.map((p) => p.slug);
    }
  } catch (err) {
    console.warn("Sitemap: using fallback project slugs due to DB API error", err);
  }

  const now = new Date();

  // Core static landing & catalog pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic project overview pages
  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${siteUrl}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
