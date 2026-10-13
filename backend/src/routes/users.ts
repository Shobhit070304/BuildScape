import { Router } from "express";
import { getPublicUserProfile, getProjectBadge } from "../controllers/users.controller";

const router = Router();

// GET /api/users/:username (public developer profile)
router.get("/:username", getPublicUserProfile);

// GET /api/users/:username/badge/:slug (convenience route)
router.get("/:username/badge/:slug", getProjectBadge);

export default router;
