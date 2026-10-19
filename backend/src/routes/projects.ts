import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  uncompletePhase,
  getProgress,
  getEnrolledProjects,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);

// Public project browsing
router.get("/", listProjects);
router.get("/:slug", getProject);

// Protected student actions
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.delete("/:slug/phases/:phaseId/complete", authenticate, uncompletePhase);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
