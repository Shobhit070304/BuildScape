import { Router } from "express";
import {
  listProjects,
  getProject,
  enrollProject,
  completePhase,
  uncompletePhase,
  getProgress,
  clearProgress,
  setCurrentPhase,
  getPhaseNote,
  savePhaseNote,
  reportPhaseIssue,
  getEnrolledProjects,
  verifyProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/authorize";

const router = Router();

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);

// Public project browsing
router.get("/", listProjects);
router.get("/:slug", getProject);

// Project management: requires admin privileges
router.post("/", authenticate, requireAdmin, createProject);
router.put("/:slug", authenticate, requireAdmin, updateProject);
router.delete("/:slug", authenticate, requireAdmin, deleteProject);

// Protected student actions
router.post("/:slug/enroll", authenticate, enrollProject);
router.post("/:slug/phases/:phaseId/complete", authenticate, completePhase);
router.delete("/:slug/phases/:phaseId/complete", authenticate, uncompletePhase);
router.get("/:slug/phases/:phaseId/note", authenticate, getPhaseNote);
router.put("/:slug/phases/:phaseId/note", authenticate, savePhaseNote);
router.post("/:slug/phases/:phaseId/issues", authenticate, reportPhaseIssue);
router.post("/:slug/verify", authenticate, verifyProject);
router.get("/:slug/progress", authenticate, getProgress);
router.put("/:slug/progress/active-phase", authenticate, setCurrentPhase);
router.delete("/:slug/progress", authenticate, clearProgress);

export default router;
