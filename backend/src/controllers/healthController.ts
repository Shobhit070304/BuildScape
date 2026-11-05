import { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { getRedisClient } from "../config/redis";

/**
 * GET /health
 * Returns a simple liveness check payload.
 */
export function getHealth(_req: Request, res: Response): void {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
}

/** GET /ready reports whether the service can reach its required database. */
export async function getReadiness(_req: Request, res: Response): Promise<void> {
    const databaseReady = mongoose.connection.readyState === 1;
    const redis = getRedisClient();
    let redisReady = !redis;
    if (redis) {
        try {
            await redis.ping();
            redisReady = true;
        } catch {
            redisReady = false;
        }
    }
    const redisRequired = env.NODE_ENV === "production";
    const ready = databaseReady && (!redisRequired || redisReady);
    res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "ready" : "not_ready",
        database: databaseReady ? "connected" : "disconnected",
        upstash: redis ? (redisReady ? "connected" : "disconnected") : "not_configured",
        timestamp: new Date().toISOString(),
    });
}
