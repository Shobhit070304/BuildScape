import { Router } from "express";
import { getPublicUserProfile } from "../controllers/users.controller";

const router = Router();

// GET /api/users/:username (public profile)
router.get("/:username", getPublicUserProfile);

export default router;

