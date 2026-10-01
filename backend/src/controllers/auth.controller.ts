import { asyncHandler } from "../middleware/asyncHandler";
import { getUserProfile, loginWithGoogle } from "../services/auth.service";
import { HttpError } from "../services/httpError";

// Handle authentication request validation and response formatting.
export const googleAuth = asyncHandler(async (req, res) => {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || !credential) {
    throw new HttpError(400, "Google credential is required");
  }
  res.json(await loginWithGoogle(credential));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: await getUserProfile(req.user!.userId) });
});
