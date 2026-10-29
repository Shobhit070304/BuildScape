import { asyncHandler } from "../middleware/asyncHandler";
import { projectsService } from "../services/projects.service";
import { feedbackService } from "../services/feedback.service";

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

export const uncompletePhase = asyncHandler(async (req, res) => {
  await projectsService.uncompletePhase(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ success: true });
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json({ ...await projectsService.getProgress(req.user!.userId, String(req.params.slug)) });
});

export const clearProgress = asyncHandler(async (req, res) => {
  await projectsService.clearProgress(req.user!.userId, String(req.params.slug));
  res.json({ success: true });
});

export const setCurrentPhase = asyncHandler(async (req, res) => {
  const currentPhaseIndex = await projectsService.setCurrentPhase(
    req.user!.userId, String(req.params.slug), String(req.body.phaseId ?? "")
  );
  res.json({ success: true, currentPhaseIndex });
});

export const getPhaseNote = asyncHandler(async (req, res) => {
  const content = await feedbackService.getNote(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ content });
});

export const savePhaseNote = asyncHandler(async (req, res) => {
  const content = await feedbackService.saveNote(req.user!.userId, String(req.params.slug), String(req.params.phaseId), req.body.content);
  res.json({ success: true, content });
});

export const reportPhaseIssue = asyncHandler(async (req, res) => {
  const issue = await feedbackService.reportIssue(req.user!.userId, String(req.params.slug), String(req.params.phaseId), req.body);
  res.status(201).json({ success: true, issue });
});

export const getEnrolledProjects = asyncHandler(async (req, res) => {
  res.json({ enrollments: await projectsService.getEnrolled(req.user!.userId) });
});

export const verifyProject = asyncHandler(async (req, res) => {
  const result = await projectsService.verifyProject(
    req.user!.userId,
    String(req.params.slug),
    req.body
  );
  res.json({ success: true, verification: result });
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
  const project = await projectsService.delete(String(req.params.slug));
  res.json({ success: true, message: `Project “${project.title}” and its learner data were deleted` });
});
