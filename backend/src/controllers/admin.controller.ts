import { asyncHandler } from "../middleware/asyncHandler";
import { feedbackService } from "../services/feedback.service";
import { User } from "../models/User";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { Project } from "../models/Project";
import { Discussion } from "../models/Discussion";
import { CurriculumIssue } from "../models/CurriculumIssue";
import { discussionsRepository } from "../repositories/discussions.repository";
import { HttpError } from "../services/httpError";

export const listCurriculumIssues = asyncHandler(async (req, res) => {
  res.json({ issues: await feedbackService.listIssues(req.query.status) });
});

export const updateCurriculumIssue = asyncHandler(async (req, res) => {
  const issue = await feedbackService.updateIssueStatus(String(req.params.issueId), req.body?.status);
  res.json({ success: true, issue });
});

export const getAdminOverview = asyncHandler(async (_req, res) => {
  const [totalUsers, totalEnrollments, totalProjects, totalDiscussions, openIssuesCount] =
    await Promise.all([
      User.countDocuments(),
      UserProjectEnrollment.countDocuments(),
      Project.countDocuments(),
      Discussion.countDocuments(),
      CurriculumIssue.countDocuments({ status: "open" }),
    ]);

  res.json({
    stats: {
      totalUsers,
      totalEnrollments,
      totalProjects,
      totalDiscussions,
      openIssuesCount,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
  }

  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (p - 1) * l;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-googleId -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Fetch enrollment counts for these users
  const userIds = users.map((u) => u._id);
  const enrollments = await UserProjectEnrollment.find({ userId: { $in: userIds } }).lean();

  const userStatsMap: Record<string, { enrolled: number; completed: number }> = {};
  for (const e of enrollments) {
    const uid = e.userId.toString();
    if (!userStatsMap[uid]) userStatsMap[uid] = { enrolled: 0, completed: 0 };
    userStatsMap[uid].enrolled++;
    if (e.completedAt) userStatsMap[uid].completed++;
  }

  const formattedUsers = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    username: u.username || "builder",
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    bio: u.bio || "",
    location: u.location || "",
    skills: u.skills || [],
    createdAt: u.createdAt,
    enrolledCount: userStatsMap[u._id.toString()]?.enrolled || 0,
    completedCount: userStatsMap[u._id.toString()]?.completed || 0,
  }));

  res.json({
    users: formattedUsers,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

export const toggleUserRole = asyncHandler(async (req, res) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const targetRole = req.body?.role === "admin" ? "admin" : "user";

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role: targetRole } },
    { returnDocument: "after" }
  ).select("-googleId -__v");

  if (!user) throw new HttpError(404, "User not found");
  res.json({ success: true, user });
});

export const listAdminDiscussions = asyncHandler(async (req, res) => {
  const { category, q, page, limit } = req.query;
  const result = await discussionsRepository.list({
    category: typeof category === "string" ? category : undefined,
    q: typeof q === "string" ? q : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 25,
    sort: "latest",
  });

  const formatted = result.discussions.map((d) => {
    const author = d.author as unknown as { _id: string; name: string; username?: string; avatar?: string };
    return {
      id: d._id.toString(),
      title: d.title,
      category: d.category,
      projectSlug: d.projectSlug,
      projectTitle: d.projectTitle,
      upvoteCount: d.upvoteCount,
      replyCount: d.replyCount,
      views: d.views,
      isResolved: d.isResolved,
      author: {
        id: author?._id?.toString() || "",
        name: author?.name || "Anonymous",
        username: author?.username || "builder",
        avatar: author?.avatar,
      },
      createdAt: d.createdAt,
    };
  });

  res.json({
    ...result,
    discussions: formatted,
  });
});

export const deleteAdminDiscussion = asyncHandler(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = await discussionsRepository.delete(id, req.user!.userId, true);
  if (!deleted) throw new HttpError(404, "Discussion not found");
  res.json({ success: true, message: "Discussion deleted by admin" });
});
