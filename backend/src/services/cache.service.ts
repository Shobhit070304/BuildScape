import { getRedisClient } from "../config/redis";

const DEFAULT_CACHE_TTL_SECONDS = 300;
const PROJECT_LIST_KEY = "buildscape:v1:projects:list";
const REVIEWS_GLOBAL_KEY = "buildscape:v1:reviews:global";
const STATS_PUBLIC_KEY = "buildscape:v1:stats:public";
const projectDetailKey = (slug: string) => `buildscape:v1:projects:slug:${slug}`;

// Upstash is the only cache store. Redis outages fall back to MongoDB without a local cache.
export async function cacheAside<T>(
  key: string,
  load: () => Promise<T>,
  ttlSeconds = DEFAULT_CACHE_TTL_SECONDS
): Promise<T> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) return cached;
    } catch (error) {
      console.warn("Upstash cache read failed; loading from MongoDB:", error);
    }
  }

  const value = await load();
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
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
    console.warn("Upstash project cache invalidation failed:", error);
  }
}

export async function invalidateReviewsCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.del(REVIEWS_GLOBAL_KEY);
  } catch (error) {
    console.warn("Upstash reviews cache invalidation failed:", error);
  }
}

export async function invalidateStatsCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.del(STATS_PUBLIC_KEY);
  } catch (error) {
    console.warn("Upstash stats cache invalidation failed:", error);
  }
}

export const projectCacheKeys = {
  list: PROJECT_LIST_KEY,
  detail: projectDetailKey,
};

export const reviewsCacheKeys = {
  global: REVIEWS_GLOBAL_KEY,
};

export const statsCacheKeys = {
  public: STATS_PUBLIC_KEY,
};

export const cacheKeys = {
  projectList: PROJECT_LIST_KEY,
  projectDetail: projectDetailKey,
  reviewsGlobal: REVIEWS_GLOBAL_KEY,
  statsPublic: STATS_PUBLIC_KEY,
};
