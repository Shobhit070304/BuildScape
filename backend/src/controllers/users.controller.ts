import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
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
