import mongoose from "mongoose";
import { Discussion, type IDiscussion, type DiscussionCategory } from "../models/Discussion";
import { DiscussionComment } from "../models/DiscussionComment";

export interface ListDiscussionsOptions {
  category?: string;
  projectSlug?: string;
  phaseId?: string;
  authorId?: string;
  sort?: "trending" | "latest" | "top" | "unanswered";
  q?: string;
  page?: number;
  limit?: number;
}

export const discussionsRepository = {
  async list(options: ListDiscussionsOptions) {
    const filter: Record<string, unknown> = {};

    if (options.category && options.category !== "all") {
      filter.category = options.category as DiscussionCategory;
    }
    if (options.projectSlug) {
      filter.projectSlug = options.projectSlug;
    }
    if (options.phaseId) {
      filter.phaseId = options.phaseId;
    }
    if (options.authorId && mongoose.Types.ObjectId.isValid(options.authorId)) {
      filter.author = new mongoose.Types.ObjectId(options.authorId);
    }
    if (options.q && options.q.trim()) {
      const regex = new RegExp(options.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (options.sort === "trending") {
      sortQuery = { upvoteCount: -1, replyCount: -1, createdAt: -1 };
    } else if (options.sort === "top") {
      sortQuery = { upvoteCount: -1, createdAt: -1 };
    } else if (options.sort === "unanswered") {
      filter.replyCount = 0;
      sortQuery = { createdAt: -1 };
    }

    const [discussions, total] = await Promise.all([
      Discussion.find(filter)
        .populate("author", "name username avatar")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Discussion.countDocuments(filter),
    ]);

    return {
      discussions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Discussion.findById(id)
      .populate("author", "name username avatar bio")
      .populate("acceptedCommentId")
      .lean();
  },

  async incrementViews(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return;
    await Discussion.findByIdAndUpdate(id, { $inc: { views: 1 } });
  },

  async create(data: {
    authorId: string;
    title: string;
    content: string;
    category: DiscussionCategory;
    projectSlug?: string;
    projectTitle?: string;
    phaseId?: string;
    phaseTitle?: string;
  }) {
    const discussion = new Discussion({
      author: new mongoose.Types.ObjectId(data.authorId),
      title: data.title,
      content: data.content,
      category: data.category,
      projectSlug: data.projectSlug,
      projectTitle: data.projectTitle,
      phaseId: data.phaseId,
      phaseTitle: data.phaseTitle,
    });
    return (await discussion.save()).populate("author", "name username avatar");
  },

  async update(id: string, authorId: string, updates: { title?: string; content?: string; category?: DiscussionCategory }) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Discussion.findOneAndUpdate(
      { _id: id, author: authorId },
      { $set: updates },
      { returnDocument: "after" }
    ).populate("author", "name username avatar");
  },

  async delete(id: string, authorId: string, isAdmin = false) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const filter = isAdmin ? { _id: id } : { _id: id, author: authorId };
    const discussion = await Discussion.findOneAndDelete(filter);
    if (discussion) {
      await DiscussionComment.deleteMany({ discussionId: discussion._id });
    }
    return discussion;
  },

  async toggleUpvote(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    const discussion = await Discussion.findById(id);
    if (!discussion) return null;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasUpvoted = discussion.upvotes.some((u) => u.equals(userObjectId));

    if (hasUpvoted) {
      discussion.upvotes = discussion.upvotes.filter((u) => !u.equals(userObjectId));
    } else {
      discussion.upvotes.push(userObjectId);
    }
    discussion.upvoteCount = discussion.upvotes.length;
    await discussion.save();

    return {
      hasUpvoted: !hasUpvoted,
      upvoteCount: discussion.upvoteCount,
    };
  },

  // Comments operations
  async listComments(discussionId: string) {
    if (!mongoose.Types.ObjectId.isValid(discussionId)) return [];
    return DiscussionComment.find({ discussionId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 })
      .lean();
  },

  async createComment(data: {
    discussionId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }) {
    const comment = new DiscussionComment({
      discussionId: new mongoose.Types.ObjectId(data.discussionId),
      author: new mongoose.Types.ObjectId(data.authorId),
      content: data.content,
      parentId: data.parentId && mongoose.Types.ObjectId.isValid(data.parentId)
        ? new mongoose.Types.ObjectId(data.parentId)
        : undefined,
    });
    const saved = await comment.save();
    await Discussion.findByIdAndUpdate(data.discussionId, { $inc: { replyCount: 1 } });
    return saved.populate("author", "name username avatar");
  },

  async toggleCommentUpvote(commentId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    const comment = await DiscussionComment.findById(commentId);
    if (!comment) return null;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasUpvoted = comment.upvotes.some((u) => u.equals(userObjectId));

    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter((u) => !u.equals(userObjectId));
    } else {
      comment.upvotes.push(userObjectId);
    }
    comment.upvoteCount = comment.upvotes.length;
    await comment.save();

    return {
      hasUpvoted: !hasUpvoted,
      upvoteCount: comment.upvoteCount,
    };
  },

  async setAcceptedSolution(discussionId: string, commentId: string, userId: string, isAdmin = false) {
    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return null;
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return null;

    // Only discussion author or admin can mark accepted solution
    if (!isAdmin && discussion.author.toString() !== userId) {
      return { forbidden: true };
    }

    const comment = await DiscussionComment.findById(commentId);
    if (!comment || !comment.discussionId.equals(discussion._id)) {
      return null;
    }

    // Toggle: if already accepted, unaccept it
    if (comment.isAcceptedSolution) {
      comment.isAcceptedSolution = false;
      discussion.isResolved = false;
      discussion.acceptedCommentId = undefined;
    } else {
      // Remove accepted solution on other comments
      await DiscussionComment.updateMany(
        { discussionId: discussion._id, isAcceptedSolution: true },
        { $set: { isAcceptedSolution: false } }
      );
      comment.isAcceptedSolution = true;
      discussion.isResolved = true;
      discussion.acceptedCommentId = comment._id;
    }

    await Promise.all([comment.save(), discussion.save()]);

    return {
      isResolved: discussion.isResolved,
      acceptedCommentId: discussion.acceptedCommentId,
    };
  },

  async deleteComment(commentId: string, userId: string, isAdmin = false) {
    if (!mongoose.Types.ObjectId.isValid(commentId)) return null;
    const comment = await DiscussionComment.findById(commentId);
    if (!comment) return null;

    if (!isAdmin && comment.author.toString() !== userId) {
      return { forbidden: true };
    }

    await DiscussionComment.findByIdAndDelete(commentId);
    await Discussion.findByIdAndUpdate(comment.discussionId, { $inc: { replyCount: -1 } });
    return comment;
  },
};
