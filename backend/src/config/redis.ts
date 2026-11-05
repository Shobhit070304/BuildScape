import { Redis } from "@upstash/redis";
import { env } from "./env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redisClient) {
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      responseEncoding: false,
    });
  }
  return redisClient;
}

export function requireRedisClient(): Redis {
  const redis = getRedisClient();
  if (!redis) throw new Error("Upstash Redis is not configured");
  return redis;
}
