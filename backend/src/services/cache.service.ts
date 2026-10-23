import { redisClient } from "./redisClient";

const warnedOperations = new Set<string>();

function warnOnce(operation: string) {
  if (warnedOperations.has(operation)) return;
  warnedOperations.add(operation);
  console.warn(`[cache] Upstash ${operation} failed; serving projects without the cache.`);
}

export async function getOrLoadCached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  if (!redisClient) return load();

  try {
    const cached = await redisClient.get<T>(key);
    if (cached !== null) return cached;
  } catch {
    warnOnce("read");
  }

  const value = await load();
  try {
    await redisClient.set(key, value, { ex: ttlSeconds });
  } catch {
    warnOnce("write");
  }
  return value;
}
