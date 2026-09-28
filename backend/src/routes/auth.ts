import { Router } from "express";
import { googleAuth, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// POST /api/auth/google
router.post("/google", googleAuth);

// GET /api/auth/me (protected)
router.get("/me", authenticate, getMe);

export default router;
