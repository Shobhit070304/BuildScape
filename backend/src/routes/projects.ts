import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  uncompletePhase,
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

const router = Router();
const projectAIHelpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI help is being used quickly. Please wait a few minutes and try again." },
});

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
router.put("/:slug/phases/:phaseId/current", authenticate, setCurrentPhase);
router.put("/:slug/bookmark", authenticate, addProjectBookmark);
router.delete("/:slug/bookmark", authenticate, removeProjectBookmark);
router.get("/:slug/notes", authenticate, getProjectNotes);
router.put("/:slug/notes", authenticate, saveProjectNotes);
router.post("/:slug/ai-help", authenticate, projectAIHelpLimiter, projectAIHelp);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
