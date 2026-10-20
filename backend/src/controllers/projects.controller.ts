import { asyncHandler } from "../middleware/asyncHandler";
import { projectsService } from "../services/projects.service";
import { projectAIService } from "../services/projectAI.service";
import { HttpError } from "../services/httpError";

export const projectAIHelp = asyncHandler(async (req, res) => {
  const { phaseId, messages } = req.body ?? {};
  if (typeof phaseId !== "string" || phaseId.length < 1 || phaseId.length > 100) {
    throw new HttpError(400, "A valid phase is required");
  }
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 10) {
    throw new HttpError(400, "Send between 1 and 10 chat messages");
  }

  let totalChars = 0;
  const safeMessages = messages.map((message: unknown) => {
    if (!message || typeof message !== "object") throw new HttpError(400, "Invalid chat message");
    const candidate = message as Record<string, unknown>;
    if ((candidate.role !== "user" && candidate.role !== "assistant") || typeof candidate.content !== "string") {
      throw new HttpError(400, "Invalid chat message");
    }
    const content = candidate.content.trim();
    if (!content || content.length > 3000) throw new HttpError(400, "Each message must be between 1 and 3000 characters");
    totalChars += content.length;
    return { role: candidate.role, content } as const;
  });

  if (totalChars > 12_000 || safeMessages[safeMessages.length - 1]?.role !== "user") {
    throw new HttpError(400, "Chat history is too long or does not end with your question");
  }

  res.set("Cache-Control", "private, no-store");
  const chunks = await projectAIService.streamReply(req.user!.userId, String(req.params.slug), phaseId, safeMessages);
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  try {
    for await (const chunk of chunks) {
      const text = chunk.text;
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.end();
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
    console.error("Gemini project AI stream failed with status:", status || "unknown");
    res.write(`data: ${JSON.stringify({ error: "The project AI guide could not finish responding. Please try again." })}\n\n`);
    res.end();
  }
});

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

export const setCurrentPhase = asyncHandler(async (req, res) => {
  await projectsService.setCurrentPhase(req.user!.userId, String(req.params.slug), String(req.params.phaseId));
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
