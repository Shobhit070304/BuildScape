import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

/**
 * Middleware requiring the authenticated user to possess the "admin" role.
 * Must be mounted after the authenticate middleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  void User.findById(req.user.userId).select("role").then((user) => {
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (user.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Admin privileges required" });
      return;
    }
    req.user!.role = "admin";
    next();
  }).catch(next);
}
