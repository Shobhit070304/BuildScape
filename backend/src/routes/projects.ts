import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  uncompletePhase,
  resetProgress,
  setCurrentPhase,
  getProgress,
  getEnrolledProjects,
  projectAIHelp,
  getBookmarkedProjects,
  addProjectBookmark,
  removeProjectBookmark,
  getProjectNotes,
  saveProjectNotes,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";
import { rateLimit } from "express-rate-limit";
import { env } from "../config/env";
import { redisClient } from "../services/redisClient";
import { UpstashRateLimitStore } from "../services/rateLimitStore";
import type { RequestHandler } from "express";

const router = Router();
const projectAIHelpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user!.userId,
  ...(redisClient ? { store: new UpstashRateLimitStore() } : {}),
  message: { message: "AI help is being used quickly. Please wait a few minutes and try again." },
});

const requireSharedAILimiter: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV === "production" && env.GEMINI_API_KEY && !redisClient) {
    res.status(503).json({ message: "Project AI help is temporarily unavailable." });
    return;
  }
  return projectAIHelpLimiter(req, res, next);
};

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);
router.get("/my/bookmarks", authenticate, getBookmarkedProjects);

// Public project browsing
router.get("/", listProjects);
router.get("/:slug", getProject);

// Protected student actions
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.delete("/:slug/phases/:phaseId/complete", authenticate, uncompletePhase);
router.delete("/:slug/progress", authenticate, resetProgress);
router.put("/:slug/phases/:phaseId/current", authenticate, setCurrentPhase);
router.put("/:slug/bookmark", authenticate, addProjectBookmark);
router.delete("/:slug/bookmark", authenticate, removeProjectBookmark);
router.get("/:slug/notes", authenticate, getProjectNotes);
router.put("/:slug/notes", authenticate, saveProjectNotes);
router.post("/:slug/ai-help", authenticate, requireSharedAILimiter, projectAIHelp);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
