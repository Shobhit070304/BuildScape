import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/users.repository";
import { UserProjectEnrollment } from "../models/UserProjectEnrollment";
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
  if (!payload?.sub || !payload.email) throw new HttpError(401, "Invalid Google token");

  const email = payload.email.toLowerCase();
  const existingUser = await userRepository.findById(payload.sub).catch(() => null);
  const isAdmin = Boolean(env.ADMIN_EMAIL && email === env.ADMIN_EMAIL);
  const role: "user" | "admin" = existingUser?.role === "admin" || isAdmin ? "admin" : "user";

  const user = await userRepository.upsertGoogleUser({
    googleId: payload.sub,
    email: payload.email,
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

// Retrieve public developer portfolio and verified proof-of-work achievements.
export async function getPublicProfile(username: string) {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new HttpError(404, "Developer profile not found");
  }

  const enrollments = await UserProjectEnrollment.find({
    userId: user._id,
    isVerified: true,
  }).populate("projectId");

  const verifiedProjects = enrollments
    .map((enrollment) => {
      const p = enrollment.projectId as unknown as {
        _id: unknown;
        slug: string;
        title: string;
        tagline: string;
        track: string;
        difficulty: string;
        estimatedHours: number;
        techStack: string[];
      } | null;
      if (!p) return null;
      return {
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        track: p.track,
        difficulty: p.difficulty,
        estimatedHours: p.estimatedHours || 0,
        techStack: p.techStack || [],
        githubRepoUrl: enrollment.githubRepoUrl,
        liveDemoUrl: enrollment.liveDemoUrl,
        verifiedAt: enrollment.verifiedAt || enrollment.completedAt || enrollment.enrolledAt,
      };
    })
    .filter(Boolean);

  const totalEstimatedProjectHours = verifiedProjects.reduce(
    (sum, p) => sum + (p?.estimatedHours || 0),
    0
  );
  const techStackSet = new Set<string>();
  verifiedProjects.forEach((p) => {
    p?.techStack.forEach((t) => techStackSet.add(t));
  });

  return {
    user: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    stats: {
      verifiedBuildsCount: verifiedProjects.length,
      totalEstimatedProjectHours,
      masteredTechStack: Array.from(techStackSet),
    },
    verifiedProjects,
  };
}
