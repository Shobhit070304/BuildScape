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

// Public project browsing
router.get("/", listProjects);
router.get("/:slug", getProject);

// Protected student actions
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.delete("/:slug/phases/:phaseId/complete", authenticate, uncompletePhase);
router.put("/:slug/phases/:phaseId/current", authenticate, setCurrentPhase);
router.post("/:slug/ai-help", authenticate, projectAIHelpLimiter, projectAIHelp);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
