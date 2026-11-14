import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/users.repository";
import { HttpError } from "./httpError";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Verify Google credentials, persist the user, and issue the app session token.
export async function loginWithGoogle(credential: string) {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
  } catch {
    throw new HttpError(401, "Google authentication failed");
  }
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new HttpError(401, "A verified Google account is required");
  }

  const email = payload.email.trim().toLowerCase();
  const isAdmin = Boolean(env.ADMIN_EMAIL && email === env.ADMIN_EMAIL);
  const role: "user" | "admin" = isAdmin ? "admin" : "user";

  const user = await userRepository.upsertGoogleUser({
    googleId: payload.sub,
    email,
    name: payload.name ?? payload.email,
    avatar: payload.picture,
    role,
  });

  const effectiveRole = user.role ?? role;
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, role: effectiveRole },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      portfolioUrl: user.portfolioUrl,
      linkedinUrl: user.linkedinUrl,
      skills: user.skills,
      savedProjects: user.savedProjects ?? [],
      role: effectiveRole,
    },
  };
}

// Load the profile represented by an authenticated session.
export async function getUserProfile(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  if (!user.username) {
    const candidate = (user.name || user.email.split("@")[0] || "builder")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20) || "builder";
    user.username = candidate;
    await user.save().catch(() => {});
  }
  return user;
}

export async function updateUsername(userId: string, requestedUsername: unknown) {
  if (typeof requestedUsername !== "string") {
    throw new HttpError(400, "Username is required");
  }

  const username = requestedUsername.trim().toLowerCase();
  if (username.length < 3 || username.length > 24 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(username)) {
    throw new HttpError(400, "Use 3–24 lowercase letters or numbers, with single hyphens between words");
  }

  const existing = await userRepository.findByUsername(username);
  if (existing && existing._id.toString() !== userId) {
    throw new HttpError(409, "That username is already taken");
  }

  try {
    const user = await userRepository.updateUsername(userId, username);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new HttpError(409, "That username is already taken");
    }
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    bio?: string;
    location?: string;
    githubUrl?: string;
    twitterUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    skills?: string[];
  }
) {
  const cleanData: Record<string, unknown> = {};

  if (typeof data.name === "string") {
    const name = data.name.trim();
    if (name.length < 2 || name.length > 50) {
      throw new HttpError(400, "Name must be between 2 and 50 characters");
    }
    cleanData.name = name;
  }

  if (typeof data.bio === "string") {
    cleanData.bio = data.bio.trim().slice(0, 300);
  }

  if (typeof data.location === "string") {
    cleanData.location = data.location.trim().slice(0, 100);
  }

  if (typeof data.githubUrl === "string") {
    cleanData.githubUrl = data.githubUrl.trim().slice(0, 200);
  }

  if (typeof data.twitterUrl === "string") {
    cleanData.twitterUrl = data.twitterUrl.trim().slice(0, 200);
  }

  if (typeof data.portfolioUrl === "string") {
    cleanData.portfolioUrl = data.portfolioUrl.trim().slice(0, 200);
  }

  if (typeof data.linkedinUrl === "string") {
    cleanData.linkedinUrl = data.linkedinUrl.trim().slice(0, 200);
  }

  if (Array.isArray(data.skills)) {
    cleanData.skills = data.skills
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim().slice(0, 30))
      .slice(0, 20);
  }

  const user = await userRepository.updateProfile(userId, cleanData);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}
