import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  getProgress,
  getEnrolledProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);

// Public project browsing
router.get("/", listProjects);
router.get("/:slug", getProject);

// Project management: add, update, delete
router.post("/", createProject);
router.put("/:slug", updateProject);
router.delete("/:slug", deleteProject);

// Protected student actions
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.get("/:slug/progress", authenticate, getProgress);

export default router;

