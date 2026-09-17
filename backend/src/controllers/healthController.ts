import { Request, Response } from "express";

/**
 * GET /health
 * Returns a simple liveness check payload.
 */
export function getHealth(_req: Request, res: Response): void {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
}
