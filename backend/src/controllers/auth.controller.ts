import { asyncHandler } from "../middleware/asyncHandler";
import {
  getUserProfile,
  loginWithGoogle,
  updateUsername,
  updateUserProfile,
} from "../services/auth.service";
import { HttpError } from "../services/httpError";

// Handle authentication request validation and response formatting.
export const googleAuth = asyncHandler(async (req, res) => {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || !credential) {
    throw new HttpError(400, "Google credential is required");
  }
  const result = await loginWithGoogle(credential);

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("bs_token", result.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  // Keep the session token in the httpOnly cookie; browser JavaScript does not need it.
  res.json({ user: result.user });
});

export const logout = asyncHandler(async (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("bs_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  res.json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user!.userId);
  res.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio ?? "",
      location: user.location ?? "",
      githubUrl: user.githubUrl ?? "",
      twitterUrl: user.twitterUrl ?? "",
      portfolioUrl: user.portfolioUrl ?? "",
      linkedinUrl: user.linkedinUrl ?? "",
      skills: user.skills ?? [],
      savedProjects: user.savedProjects ?? [],
      role: user.role,
    },
  });
});

export const changeUsername = asyncHandler(async (req, res) => {
  const user = await updateUsername(req.user!.userId, req.body?.username);
  res.json({ username: user.username });
});

export const editProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user!.userId, req.body ?? {});
  res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio ?? "",
      location: user.location ?? "",
      githubUrl: user.githubUrl ?? "",
      twitterUrl: user.twitterUrl ?? "",
      portfolioUrl: user.portfolioUrl ?? "",
      linkedinUrl: user.linkedinUrl ?? "",
      skills: user.skills ?? [],
      savedProjects: user.savedProjects ?? [],
      role: user.role,
    },
  });
});
