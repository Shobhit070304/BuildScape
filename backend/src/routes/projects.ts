import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  getProgress,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Public
router.get("/", listProjects);
router.get("/:slug", getProject);

// Protected
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.get("/:slug/progress", authenticate, getProgress);

export default router;
