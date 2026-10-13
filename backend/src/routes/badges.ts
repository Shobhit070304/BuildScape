import { Router } from "express";
import { getProjectBadge } from "../controllers/users.controller";

const router = Router();

// GET /api/badges/:username/:slug
router.get("/:username/:slug", getProjectBadge);

export default router;
