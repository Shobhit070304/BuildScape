import { getRedisClient } from "../config/redis";

const PROJECT_CACHE_TTL_SECONDS = 300;
const PROJECT_LIST_KEY = "buildscape:v1:projects:list";
const projectDetailKey = (slug: string) => `buildscape:v1:projects:slug:${slug}`;

// Upstash is the only cache store. Redis outages fall back to MongoDB without a local cache.
export async function cacheAside<T>(key: string, load: () => Promise<T>): Promise<T> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null) return cached;
    } catch (error) {
      console.warn("Upstash cache read failed; loading from MongoDB:", error);
    }
  }

  const value = await load();
  if (redis) {
    try {
      await redis.set(key, value, { ex: PROJECT_CACHE_TTL_SECONDS });
    } catch (error) {
      console.warn("Upstash cache write failed:", error);
    }
  }
  return value;
}

export async function invalidateProjectCache(...slugs: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    const keys = [PROJECT_LIST_KEY, ...new Set(slugs.filter(Boolean).map(projectDetailKey))];
    await redis.del(...keys);
  } catch (error) {
    // TTL keeps stale public curriculum bounded if invalidation is temporarily unavailable.
    console.warn("Upstash project cache invalidation failed:", error);
  }
}

export const projectCacheKeys = {
  list: PROJECT_LIST_KEY,
  detail: projectDetailKey,
};
