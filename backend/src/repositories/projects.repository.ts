import { Project, IProject } from "../models/Project";

// Project persistence operations.
export const projectRepository = {
  list: () => Project.find().select("-phases.content").sort({ createdAt: -1 }),
  findBySlug: (slug: string) => Project.findOne({ slug }),
  findPhasesBySlug: (slug: string) => Project.findOne({ slug }, { phases: 1 }),
  create: (values: Partial<IProject>) => Project.create(values),
  updateBySlug: (slug: string, values: Partial<IProject>) =>
    Project.findOneAndUpdate({ slug }, values, { new: true, upsert: true }),
  deleteBySlug: (slug: string) => Project.findOneAndDelete({ slug }),
};
