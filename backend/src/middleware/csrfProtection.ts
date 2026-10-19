import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function configuredOrigin(): string {
  try {
    return new URL(env.CORS_ORIGIN).origin;
  } catch {
    return env.CORS_ORIGIN.replace(/\/$/, "");
  }
}

/** Reject browser writes initiated by origins other than the configured frontend. */
export function protectAgainstCrossSiteWrites(req: Request, res: Response, next: NextFunction): void {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (!origin && req.cookies?.bs_token) {
    res.status(403).json({ error: "Origin header is required for session writes" });
    return;
  }
  if (origin && origin !== configuredOrigin()) {
    res.status(403).json({ error: "Cross-origin write rejected" });
    return;
  }

  next();
}
