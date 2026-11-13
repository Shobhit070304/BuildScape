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
  getMyIssues,
  getEnrolledProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleTaskProgress,
  verifyProjectSubmission,
  getProjectCertificate,
} from "../controllers/projects.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/authorize";
import rateLimit from "express-rate-limit";

const router = Router();
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." },
});

// User enrolled projects (must be before /:slug)
router.get("/my/enrolled", authenticate, getEnrolledProjects);
router.get("/my/issues", authenticate, getMyIssues);

// Public verifiable certificate lookup (must be before /:slug)
router.get("/certificates/:certificateId", getProjectCertificate);

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
router.post("/:slug/phases/:phaseId/tasks/:taskId/toggle", authenticate, toggleTaskProgress);
router.post("/:slug/verify", authenticate, feedbackLimiter, verifyProjectSubmission);
router.get("/:slug/phases/:phaseId/note", authenticate, getPhaseNote);
router.put("/:slug/phases/:phaseId/note", authenticate, savePhaseNote);
router.post("/:slug/phases/:phaseId/issues", authenticate, feedbackLimiter, reportPhaseIssue);
router.get("/:slug/progress", authenticate, getProgress);
router.put("/:slug/progress/active-phase", authenticate, setCurrentPhase);
router.delete("/:slug/progress", authenticate, clearProgress);

export default router;
