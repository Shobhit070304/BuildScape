import { Router } from "express";
import {
  listCurriculumIssues,
  updateCurriculumIssue,
  getAdminOverview,
  listUsers,
  toggleUserRole,
  listAdminDiscussions,
  deleteAdminDiscussion,
} from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/authorize";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.patch("/users/:userId/role", toggleUserRole);
router.get("/discussions", listAdminDiscussions);
router.delete("/discussions/:id", deleteAdminDiscussion);
router.get("/curriculum-issues", listCurriculumIssues);
router.patch("/curriculum-issues/:issueId", updateCurriculumIssue);

export default router;
