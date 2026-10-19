import { Project } from "../models/Project";
import { loadProjectCatalog } from "../services/projectCatalog.service";

const canonicalSlugs = new Set(loadProjectCatalog().map(({ slug }) => slug));
const canonicalFilter = { slug: { $in: [...canonicalSlugs] } };

// Project persistence operations.
export const projectRepository = {
  list: () => Project.find(canonicalFilter).select("-phases.content").sort({ createdAt: -1 }),
  findBySlug: (slug: string) => canonicalSlugs.has(slug) ? Project.findOne({ slug }) : null,
  findPhasesBySlug: (slug: string) => canonicalSlugs.has(slug) ? Project.findOne({ slug }, { phases: 1 }) : null,
};
