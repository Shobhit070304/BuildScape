import { asyncHandler } from "../middleware/asyncHandler";
import { getUserProfile, loginWithGoogle } from "../services/auth.service";
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

  res.json(result);
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
  res.json({ user: await getUserProfile(req.user!.userId) });
});
