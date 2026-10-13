import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { fetchProjectsFromDb } from "@/lib/projects";

// Fallback project slugs to guarantee indexing even if database is warming up during build
const FALLBACK_PROJECT_SLUGS = [
  "distributed-task-queue-redis-go",
  "redis-lite",
  "kafka-lite-storage-engine",
  "postgres-sharded-cluster-router",
  "nextjs-link-in-bio-analytics",
  "raft-consensus-kv-store",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  let projectSlugs: string[] = FALLBACK_PROJECT_SLUGS;
  try {
    const projects = await fetchProjectsFromDb();
    if (projects && projects.length > 0) {
      projectSlugs = Array.from(new Set([...projects.map((p) => p.slug), ...FALLBACK_PROJECT_SLUGS]));
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
