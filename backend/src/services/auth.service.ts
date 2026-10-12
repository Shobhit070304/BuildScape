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
      avatar: user.avatar,
      role: effectiveRole,
    },
  };
}

// Load the profile represented by an authenticated session.
export async function getUserProfile(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}
