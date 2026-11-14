import { Router } from "express";
import { getPublicUserProfile, getUserActivity } from "../controllers/users.controller";

const router = Router();

// GET /api/users/:username/activity (contribution graph & streaks)
router.get("/:username/activity", getUserActivity);

// GET /api/users/:username (public profile)
router.get("/:username", getPublicUserProfile);

export default router;

