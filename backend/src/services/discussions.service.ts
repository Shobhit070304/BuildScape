import { discussionsRepository, type ListDiscussionsOptions } from "../repositories/discussions.repository";
import { Project } from "../models/Project";
import { HttpError } from "./httpError";
import type { DiscussionCategory } from "../models/Discussion";

const ALLOWED_CATEGORIES: DiscussionCategory[] = ["general", "question", "showcase", "architecture", "tip"];

export const discussionsService = {
  async listDiscussions(options: ListDiscussionsOptions, currentUserId?: string) {
    const result = await discussionsRepository.list(options);

    const formatted = result.discussions.map((d) => {
      const author = d.author as unknown as { _id: string; name: string; username?: string; avatar?: string };
      const hasUpvoted = currentUserId
        ? (d.upvotes || []).some((u) => u.toString() === currentUserId)
        : false;

      return {
        id: d._id.toString(),
        title: d.title,
        content: d.content,
        category: d.category,
        projectSlug: d.projectSlug,
        projectTitle: d.projectTitle,
        phaseId: d.phaseId,
        phaseTitle: d.phaseTitle,
        upvoteCount: d.upvoteCount,
        replyCount: d.replyCount,
        views: d.views,
        isResolved: d.isResolved,
        hasUpvoted,
        author: {
          id: author?._id?.toString() || "",
          name: author?.name || "Anonymous",
          username: author?.username || "builder",
          avatar: author?.avatar,
        },
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });

    return {
      ...result,
      discussions: formatted,
    };
  },

  async getDiscussion(id: string, currentUserId?: string) {
    const discussion = await discussionsRepository.findById(id);
    if (!discussion) throw new HttpError(404, "Discussion not found");

    void discussionsRepository.incrementViews(id);

    const author = discussion.author as unknown as { _id: string; name: string; username?: string; avatar?: string; bio?: string };
    const hasUpvoted = currentUserId
      ? (discussion.upvotes || []).some((u) => u.toString() === currentUserId)
      : false;

    return {
      id: discussion._id.toString(),
      title: discussion.title,
      content: discussion.content,
      category: discussion.category,
      projectSlug: discussion.projectSlug,
      projectTitle: discussion.projectTitle,
      phaseId: discussion.phaseId,
      phaseTitle: discussion.phaseTitle,
      upvoteCount: discussion.upvoteCount,
      replyCount: discussion.replyCount,
      views: discussion.views + 1,
      isResolved: discussion.isResolved,
      acceptedCommentId: discussion.acceptedCommentId ? discussion.acceptedCommentId.toString() : null,
      hasUpvoted,
      author: {
        id: author?._id?.toString() || "",
        name: author?.name || "Anonymous",
        username: author?.username || "builder",
        avatar: author?.avatar,
        bio: author?.bio || "",
      },
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
    };
  },

  async createDiscussion(
    userId: string,
    data: {
      title: unknown;
      content: unknown;
      category?: unknown;
      projectSlug?: unknown;
      phaseId?: unknown;
    }
  ) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      throw new HttpError(400, "Discussion title is required");
    }
    const title = data.title.trim();
    if (title.length < 5 || title.length > 200) {
      throw new HttpError(400, "Title must be between 5 and 200 characters");
    }

    if (typeof data.content !== "string" || !data.content.trim()) {
      throw new HttpError(400, "Discussion content is required");
    }
    const content = data.content.trim();
    if (content.length < 10) {
      throw new HttpError(400, "Content must be at least 10 characters");
    }

    const category = (typeof data.category === "string" && ALLOWED_CATEGORIES.includes(data.category as DiscussionCategory))
      ? (data.category as DiscussionCategory)
      : "general";

    let projectSlug: string | undefined;
    let projectTitle: string | undefined;
    let phaseId: string | undefined;
    let phaseTitle: string | undefined;

    if (typeof data.projectSlug === "string" && data.projectSlug.trim()) {
      projectSlug = data.projectSlug.trim();
      const project = await Project.findOne({ slug: projectSlug }).select("title phases").lean();
      if (project) {
        projectTitle = project.title;
        if (typeof data.phaseId === "string" && data.phaseId.trim()) {
          phaseId = data.phaseId.trim();
          const phase = project.phases?.find((p) => p.id === phaseId);
          if (phase) {
            phaseTitle = phase.title;
          }
        }
      }
    }

    const discussion = await discussionsRepository.create({
      authorId: userId,
      title,
      content,
      category,
      projectSlug,
      projectTitle,
      phaseId,
      phaseTitle,
    });

    return discussion;
  },

  async toggleUpvote(id: string, userId: string) {
    const result = await discussionsRepository.toggleUpvote(id, userId);
    if (!result) throw new HttpError(404, "Discussion not found");
    return result;
  },

  async deleteDiscussion(id: string, userId: string, isAdmin: boolean) {
    const deleted = await discussionsRepository.delete(id, userId, isAdmin);
    if (!deleted) throw new HttpError(404, "Discussion not found or permission denied");
    return { success: true };
  },

  // Comments
  async listComments(discussionId: string, currentUserId?: string) {
    const comments = await discussionsRepository.listComments(discussionId);

    return comments.map((c) => {
      const author = c.author as unknown as { _id: string; name: string; username?: string; avatar?: string };
      const hasUpvoted = currentUserId
        ? (c.upvotes || []).some((u) => u.toString() === currentUserId)
        : false;

      return {
        id: c._id.toString(),
        discussionId: c.discussionId.toString(),
        content: c.content,
        parentId: c.parentId ? c.parentId.toString() : null,
        upvoteCount: c.upvoteCount,
        isAcceptedSolution: c.isAcceptedSolution,
        hasUpvoted,
        author: {
          id: author?._id?.toString() || "",
          name: author?.name || "Anonymous",
          username: author?.username || "builder",
          avatar: author?.avatar,
        },
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
  },

  async createComment(
    userId: string,
    discussionId: string,
    data: { content: unknown; parentId?: unknown }
  ) {
    if (typeof data.content !== "string" || !data.content.trim()) {
      throw new HttpError(400, "Comment content cannot be blank");
    }
    const content = data.content.trim();
    if (content.length < 2) {
      throw new HttpError(400, "Comment must be at least 2 characters");
    }

    const parentId = typeof data.parentId === "string" && data.parentId.trim()
      ? data.parentId.trim()
      : undefined;

    const comment = await discussionsRepository.createComment({
      discussionId,
      authorId: userId,
      content,
      parentId,
    });

    return comment;
  },

  async toggleCommentUpvote(commentId: string, userId: string) {
    const result = await discussionsRepository.toggleCommentUpvote(commentId, userId);
    if (!result) throw new HttpError(404, "Comment not found");
    return result;
  },

  async acceptSolution(discussionId: string, commentId: string, userId: string, isAdmin: boolean) {
    const result = await discussionsRepository.setAcceptedSolution(discussionId, commentId, userId, isAdmin);
    if (!result) throw new HttpError(404, "Discussion or comment not found");
    if ("forbidden" in result && result.forbidden) {
      throw new HttpError(403, "Only the author of this discussion can mark an accepted solution");
    }
    return result;
  },

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const result = await discussionsRepository.deleteComment(commentId, userId, isAdmin);
    if (!result) throw new HttpError(404, "Comment not found");
    if ("forbidden" in result && result.forbidden) {
      throw new HttpError(403, "You can only delete your own comments");
    }
    return { success: true };
  },
};

