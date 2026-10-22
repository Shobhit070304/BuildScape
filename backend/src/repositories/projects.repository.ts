import { Project } from "../models/Project";
import { loadProjectCatalog } from "../services/projectCatalog.service";

const canonicalSlugs = new Set(loadProjectCatalog().map(({ slug }) => slug));
const canonicalFilter = { slug: { $in: [...canonicalSlugs] } };

// Project persistence operations.
export const projectRepository = {
  list: () => Project.find(canonicalFilter).select("-phases.content").sort({ createdAt: -1 }),
  findBySlugs: (slugs: string[]) => {
    const validSlugs = slugs.filter((slug) => canonicalSlugs.has(slug));
    return validSlugs.length
      ? Project.find({ slug: { $in: validSlugs } }).select("slug title tagline track difficulty estimatedHours techStack")
      : Promise.resolve([]);
  },
  findBySlug: (slug: string) => canonicalSlugs.has(slug) ? Project.findOne({ slug }) : null,
  findPhasesBySlug: (slug: string) => canonicalSlugs.has(slug) ? Project.findOne({ slug }, { phases: 1 }) : null,
};
