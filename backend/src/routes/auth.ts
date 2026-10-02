import { Router } from "express";
import { googleAuth, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

const router = Router();

// POST /api/auth/google
router.post("/google", authLimiter, googleAuth);

// GET /api/auth/me (protected)
router.get("/me", authenticate, getMe);

export default router;
