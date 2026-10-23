import { Redis } from "@upstash/redis";
import { env } from "../config/env";

export const redisClient = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      retry: { retries: 1, backoff: () => 100 },
      signal: () => AbortSignal.timeout(1500),
    })
  : null;

if (Boolean(env.UPSTASH_REDIS_REST_URL) !== Boolean(env.UPSTASH_REDIS_REST_TOKEN)) {
  console.warn("[redis] Set both Upstash REST environment variables to enable shared services.");
}
