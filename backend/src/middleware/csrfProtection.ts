import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Require same-origin requests for writes authenticated by the session cookie. */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (!unsafeMethods.has(req.method) || !req.cookies?.bs_token) {
    next();
    return;
  }

  const origin = req.get("origin");
  try {
    if (origin && new URL(origin).origin === new URL(env.CORS_ORIGIN).origin) {
      next();
      return;
    }
  } catch {
    // Invalid/missing origins fail closed for cookie-authenticated writes.
  }

  res.status(403).json({ error: "Request origin is not allowed" });
}
