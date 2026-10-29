import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getPublicProfile } from "../services/auth.service";

export const getPublicUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getPublicProfile(String(req.params.username));
  res.json(profile);
});
