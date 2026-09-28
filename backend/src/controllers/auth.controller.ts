import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 * Body: { credential: <Google ID token from Google One Tap / OAuth popup> }
 * Returns: { token, user }
 */
export async function googleAuth(req: Request, res: Response) {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ error: "Google credential is required" });
    return;
  }

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    // Upsert user in DB
    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        avatar: payload.picture,
      },
      { upsert: true, new: true }
    );

    // Sign our own JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export async function getMe(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!.userId).select("-__v");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
