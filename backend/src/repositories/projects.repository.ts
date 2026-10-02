import { Project, IProject } from "../models/Project";
import { HttpError } from "../services/httpError";

// Project persistence operations.
export const projectRepository = {
  list: () => Project.find().select("-phases.content").sort({ createdAt: -1 }),
  findBySlug: (slug: string) => Project.findOne({ slug }),
  findPhasesBySlug: (slug: string) => Project.findOne({ slug }, { phases: 1 }),
  create: (values: Partial<IProject>) => Project.create(values),
  updateBySlug: async (slug: string, values: Partial<IProject>) => {
    const project = await Project.findOneAndUpdate({ slug }, values, { new: true });
    if (!project) throw new HttpError(404, "Project not found");
    return project;
  },
  deleteBySlug: (slug: string) => Project.findOneAndDelete({ slug }),
};
