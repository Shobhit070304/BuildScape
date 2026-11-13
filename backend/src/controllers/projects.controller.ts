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
    req.user!.userId, String(req.params.slug), String(req.body?.phaseId ?? "")
  );
  res.json({ success: true, currentPhaseIndex });
});

export const getPhaseNote = asyncHandler(async (req, res) => {
  const content = await feedbackService.getNote(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
  res.json({ content });
});

export const savePhaseNote = asyncHandler(async (req, res) => {
  const content = await feedbackService.saveNote(req.user!.userId, String(req.params.slug), String(req.params.phaseId), req.body?.content);
  res.json({ success: true, content });
});

export const reportPhaseIssue = asyncHandler(async (req, res) => {
  const issue = await feedbackService.reportIssue(req.user!.userId, String(req.params.slug), String(req.params.phaseId), req.body);
  res.status(201).json({ success: true, issue });
});

export const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await feedbackService.listUserIssues(req.user!.userId);
  res.json({ issues });
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
  const project = await projectsService.delete(String(req.params.slug));
  res.json({ success: true, message: `Project “${project.title}” and its learner data were deleted` });
});

export const toggleTaskProgress = asyncHandler(async (req, res) => {
  const { slug, phaseId, taskId } = req.params;
  const { completed } = req.body ?? {};
  const result = await projectsService.toggleTaskProgress(
    req.user!.userId,
    String(slug),
    String(phaseId),
    String(taskId),
    typeof completed === "boolean" ? completed : undefined
  );
  res.json(result);
});

export const verifyProjectSubmission = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { githubRepoUrl, liveDemoUrl } = req.body ?? {};
  if (!githubRepoUrl || typeof githubRepoUrl !== "string") {
    res.status(400).json({ message: "githubRepoUrl is required" });
    return;
  }
  const result = await projectsService.verifyProjectSubmission(
    req.user!.userId,
    String(slug),
    {
      githubRepoUrl,
      liveDemoUrl: typeof liveDemoUrl === "string" ? liveDemoUrl : undefined,
    }
  );
  res.json(result);
});

export const getProjectCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;
  const certificate = await projectsService.getCertificate(String(certificateId));
  res.json({ certificate });
});
