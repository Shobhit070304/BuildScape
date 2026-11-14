import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
import { UserTaskProgress } from "../models/UserTaskProgress";
import { UserMilestoneTaskProgress } from "../models/UserMilestoneTaskProgress";
import { Discussion } from "../models/Discussion";
import { DiscussionComment } from "../models/DiscussionComment";
import { HttpError } from "../services/httpError";

export const getPublicUserProfile = asyncHandler(async (req, res) => {
  const rawUsername = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const username = rawUsername?.trim().toLowerCase();
  if (!username) {
    throw new HttpError(400, "Username is required");
  }

  const user = await User.findOne({ username }).select("-googleId -email -__v");
  if (!user) {
    throw new HttpError(404, "User profile not found");
  }

  const [enrollments, discussionsCount, solutionsCount] = await Promise.all([
    UserProjectEnrollment.find({ userId: user._id })
      .populate("projectId", "title slug shortDescription track difficulty estimatedHours techStack icon")
      .sort({ enrolledAt: -1 })
      .lean(),
    Discussion.countDocuments({ author: user._id }),
    DiscussionComment.countDocuments({ author: user._id, isAcceptedSolution: true }),
  ]);

  const projects = enrollments
    .filter((e) => e.projectId != null)
    .map((e) => {
      const proj = e.projectId as unknown as {
        _id: string;
        title: string;
        slug: string;
        shortDescription: string;
        track: string;
        difficulty: string;
        estimatedHours: number;
        techStack: string[];
        icon?: string;
      };
      return {
        title: proj.title,
        slug: proj.slug,
        shortDescription: proj.shortDescription,
        track: proj.track,
        difficulty: proj.difficulty,
        estimatedHours: proj.estimatedHours,
        techStack: proj.techStack,
        icon: proj.icon,
        isCompleted: Boolean(e.completedAt),
        completedAt: e.completedAt,
        enrolledAt: e.enrolledAt,
        githubRepoUrl: e.githubRepoUrl,
        liveDemoUrl: e.liveDemoUrl,
      };
    });

  const completedProjectsCount = projects.filter((p) => p.isCompleted).length;

  res.json({
    profile: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio || "",
      location: user.location || "",
      githubUrl: user.githubUrl || "",
      twitterUrl: user.twitterUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      linkedinUrl: user.linkedinUrl || "",
      skills: user.skills || [],
      createdAt: user.createdAt,
    },
    stats: {
      completedProjectsCount,
      enrolledProjectsCount: projects.length,
      discussionsCount,
      solutionsCount,
    },
    projects,
  });
});

export const getUserActivity = asyncHandler(async (req, res) => {
  const rawUsername = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const username = rawUsername?.trim().toLowerCase();
  if (!username) {
    throw new HttpError(400, "Username is required");
  }

  const user = await User.findOne({ username }).select("_id").lean();
  if (!user) {
    throw new HttpError(404, "User profile not found");
  }

  const [milestones, phaseProgress, enrollments, discussions, comments] = await Promise.all([
    UserMilestoneTaskProgress.find({ userId: user._id }).select("completedAt").lean(),
    UserTaskProgress.find({ userId: user._id }).select("completedAt").lean(),
    UserProjectEnrollment.find({ userId: user._id }).select("enrolledAt completedAt").lean(),
    Discussion.find({ author: user._id }).select("createdAt").lean(),
    DiscussionComment.find({ author: user._id }).select("createdAt").lean(),
  ]);

  const dailyCounts: Record<string, number> = {};

  const recordDate = (d: Date | undefined | null) => {
    if (!d) return;
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return;
    const key = dateObj.toISOString().slice(0, 10);
    dailyCounts[key] = (dailyCounts[key] || 0) + 1;
  };

  milestones.forEach((m) => recordDate(m.completedAt));
  phaseProgress.forEach((p) => recordDate(p.completedAt));
  enrollments.forEach((e) => {
    recordDate(e.enrolledAt);
    if (e.completedAt) recordDate(e.completedAt);
  });
  discussions.forEach((d) => recordDate(d.createdAt));
  comments.forEach((c) => recordDate(c.createdAt));

  // Build calendar for the past 365 days (ending today)
  const now = new Date();
  const calendar: { date: string; count: number; level: number }[] = [];
  let totalContributions = 0;

  for (let i = 364; i >= 0; i--) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - i);
    const dateStr = day.toISOString().slice(0, 10);
    const count = dailyCounts[dateStr] || 0;
    totalContributions += count;

    let level = 0;
    if (count >= 1 && count <= 2) level = 1;
    else if (count >= 3 && count <= 5) level = 2;
    else if (count >= 6 && count <= 9) level = 3;
    else if (count >= 10) level = 4;

    calendar.push({ date: dateStr, count, level });
  }

  // Calculate current streak
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let currentStreak = 0;
  let checkDate = new Date(now);

  // If today has no activity yet, check yesterday to preserve ongoing streak
  if (!dailyCounts[todayStr] && dailyCounts[yesterdayStr]) {
    checkDate = yesterday;
  }

  while (true) {
    const key = checkDate.toISOString().slice(0, 10);
    if (dailyCounts[key] && dailyCounts[key] > 0) {
      currentStreak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across all recorded activity
  const activeDates = Object.keys(dailyCounts)
    .filter((d) => dailyCounts[d] > 0)
    .sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of activeDates) {
    const currentDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (prevDate) {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    } else {
      runningStreak = 1;
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  res.json({
    calendar,
    totalContributions,
    currentStreak,
    longestStreak,
  });
});
