import { Router } from "express";
import {
  getGlobalReviews,
  getMyReview,
  createOrUpdateReview,
  deleteMyReview,
} from "../controllers/reviews.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// GET /api/reviews - public list of featured reviews
router.get("/", getGlobalReviews);

// GET /api/reviews/me - get current user's review
router.get("/me", authenticate, getMyReview);

// POST /api/reviews - create or update current user's review
router.post("/", authenticate, createOrUpdateReview);

// DELETE /api/reviews - delete current user's review
router.delete("/", authenticate, deleteMyReview);

export default router;
