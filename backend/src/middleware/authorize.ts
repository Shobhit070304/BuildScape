import { Request, Response, NextFunction } from "express";

/**
 * Middleware requiring the authenticated user to possess the "admin" role.
 * Must be mounted after the authenticate middleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admin privileges required" });
    return;
  }

  next();
}
