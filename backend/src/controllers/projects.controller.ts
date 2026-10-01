import { asyncHandler } from "../middleware/asyncHandler";
import { projectsService } from "../services/projects.service";

// Keep HTTP parsing and response formatting in controllers.
export const listProjects = asyncHandler(async (_req, res) => {
  res.json({ projects: await projectsService.list() });
});

export const getProject = asyncHandler(async (req, res) => {
  res.json({ project: await projectsService.getBySlug(String(req.params.slug)) });
});

export const enrollProject = asyncHandler(async (req, res) => {
  const enrollment = await projectsService.enroll(req.user!.userId, String(req.params.slug));
  res.json({ enrollment });
});

export const completePhase = asyncHandler(async (req, res) => {
  await projectsService.completePhase(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ success: true });
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json({ ...await projectsService.getProgress(req.user!.userId, String(req.params.slug)) });
});

export const getEnrolledProjects = asyncHandler(async (req, res) => {
  res.json({ enrollments: await projectsService.getEnrolled(req.user!.userId) });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectsService.create(req.body);
  res.status(201).json({ success: true, project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectsService.update(String(req.params.slug), req.body);
  res.json({ success: true, project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectsService.delete(String(req.params.slug));
  res.json({ success: true, message: "Project deleted successfully" });
});
