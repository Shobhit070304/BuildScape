import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  getProgress,
  getEnrolledProjects,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);

// Public
router.get("/", listProjects);
router.get("/:slug", getProject);

// Protected
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
