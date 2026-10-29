import { Router } from "express";
import { listCurriculumIssues, updateCurriculumIssue } from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/authorize";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/curriculum-issues", listCurriculumIssues);
router.patch("/curriculum-issues/:issueId", updateCurriculumIssue);
export default router;
