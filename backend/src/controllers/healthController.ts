import { Request, Response } from "express";
import mongoose from "mongoose";

/**
 * GET /health
 * Returns a simple liveness check payload.
 */
export function getHealth(_req: Request, res: Response): void {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
}

/** GET /ready reports whether the service can reach its required database. */
export function getReadiness(_req: Request, res: Response): void {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "ready" : "not_ready",
        database: ready ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
}
