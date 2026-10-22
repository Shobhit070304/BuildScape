import { Redis } from "@upstash/redis";
import { env } from "../config/env";

const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      retry: { retries: 1, backoff: () => 100 },
      signal: () => AbortSignal.timeout(1500),
    })
  : null;

if (Boolean(env.UPSTASH_REDIS_REST_URL) !== Boolean(env.UPSTASH_REDIS_REST_TOKEN)) {
  console.warn("[cache] Set both Upstash REST environment variables to enable the project cache.");
}

const warnedOperations = new Set<string>();

function warnOnce(operation: string) {
  if (warnedOperations.has(operation)) return;
  warnedOperations.add(operation);
  console.warn(`[cache] Upstash ${operation} failed; serving projects without the cache.`);
}

export async function getOrLoadCached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  if (!redis) return load();

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) return cached;
  } catch {
    warnOnce("read");
  }

  const value = await load();
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    warnOnce("write");
  }
  return value;
}
