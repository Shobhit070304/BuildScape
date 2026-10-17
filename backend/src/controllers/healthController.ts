import { Request, Response } from "express";
import mongoose from "mongoose";

/**
 * GET /health
 * Returns API readiness, including MongoDB connectivity.
 */
export function getHealth(_req: Request, res: Response): void {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "ok" : "database_unavailable",
        timestamp: new Date().toISOString(),
    });
}
