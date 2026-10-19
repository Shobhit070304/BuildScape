import { asyncHandler } from "../middleware/asyncHandler";
import { projectsService } from "../services/projects.service";

// Keep HTTP parsing and response formatting in controllers.
export const listProjects = asyncHandler(async (_req, res) => {
  res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.json({ projects: await projectsService.list() });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectsService.getBySlug(String(req.params.slug));
  const enrolledUsersCount = await projectsService.countEnrolled(project._id.toString());
  res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.json({ project: { ...project.toObject(), enrolledUsersCount } });
});

export const enrollProject = asyncHandler(async (req, res) => {
  const enrollment = await projectsService.enroll(req.user!.userId, String(req.params.slug));
  res.json({ enrollment });
});

export const completePhase = asyncHandler(async (req, res) => {
  await projectsService.completePhase(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ success: true });
});

export const uncompletePhase = asyncHandler(async (req, res) => {
  await projectsService.uncompletePhase(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ success: true });
});

export const getProgress = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  res.json({ ...await projectsService.getProgress(req.user!.userId, String(req.params.slug)) });
});

export const getEnrolledProjects = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  res.json({ enrollments: await projectsService.getEnrolled(req.user!.userId) });
});
