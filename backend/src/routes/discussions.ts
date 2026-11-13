import { Router } from "express";
import {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  toggleUpvoteDiscussion,
  deleteDiscussion,
  getDiscussionComments,
  createComment,
  toggleUpvoteComment,
  acceptCommentSolution,
  deleteComment,
} from "../controllers/discussions.controller";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate";

const router = Router();

// Discussions
router.get("/", optionalAuthenticate, getDiscussions);
router.post("/", authenticate, createDiscussion);
router.get("/:id", optionalAuthenticate, getDiscussionById);
router.delete("/:id", authenticate, deleteDiscussion);
router.post("/:id/upvote", authenticate, toggleUpvoteDiscussion);

// Comments
router.get("/:id/comments", optionalAuthenticate, getDiscussionComments);
router.post("/:id/comments", authenticate, createComment);
router.post("/:id/comments/:commentId/upvote", authenticate, toggleUpvoteComment);
router.post("/:id/comments/:commentId/accept", authenticate, acceptCommentSolution);
router.delete("/:id/comments/:commentId", authenticate, deleteComment);

export default router;

