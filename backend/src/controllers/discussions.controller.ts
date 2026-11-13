import { asyncHandler } from "../middleware/asyncHandler";
import { discussionsService } from "../services/discussions.service";

function paramToString(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

export const getDiscussions = asyncHandler(async (req, res) => {
  const { category, projectSlug, phaseId, authorId, sort, q, page, limit } = req.query;
  const currentUserId = req.user?.userId;

  const result = await discussionsService.listDiscussions(
    {
      category: typeof category === "string" ? category : undefined,
      projectSlug: typeof projectSlug === "string" ? projectSlug : undefined,
      phaseId: typeof phaseId === "string" ? phaseId : undefined,
      authorId: typeof authorId === "string" ? authorId : undefined,
      sort: sort as "trending" | "latest" | "top" | "unanswered" | undefined,
      q: typeof q === "string" ? q : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    },
    currentUserId
  );

  res.json(result);
});

export const getDiscussionById = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.userId;
  const discussion = await discussionsService.getDiscussion(paramToString(req.params.id), currentUserId);
  res.json({ discussion });
});

export const createDiscussion = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const discussion = await discussionsService.createDiscussion(userId, req.body ?? {});
  res.status(201).json({ discussion });
});

export const toggleUpvoteDiscussion = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const result = await discussionsService.toggleUpvote(paramToString(req.params.id), userId);
  res.json(result);
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  const result = await discussionsService.deleteDiscussion(paramToString(req.params.id), userId, isAdmin);
  res.json(result);
});

// Comments
export const getDiscussionComments = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.userId;
  const comments = await discussionsService.listComments(paramToString(req.params.id), currentUserId);
  res.json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const comment = await discussionsService.createComment(userId, paramToString(req.params.id), req.body ?? {});
  res.status(201).json({ comment });
});

export const toggleUpvoteComment = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const result = await discussionsService.toggleCommentUpvote(paramToString(req.params.commentId), userId);
  res.json(result);
});

export const acceptCommentSolution = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  const result = await discussionsService.acceptSolution(
    paramToString(req.params.id),
    paramToString(req.params.commentId),
    userId,
    isAdmin
  );
  res.json(result);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  const result = await discussionsService.deleteComment(paramToString(req.params.commentId), userId, isAdmin);
  res.json(result);
});
