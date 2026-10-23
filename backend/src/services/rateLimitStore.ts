import type { Options, Store } from "express-rate-limit";
import { redisClient } from "./redisClient";

const incrementScript = `
local totalHits = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])
if totalHits == 1 or ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { totalHits, ttl }
`;

/** Shared fixed-window counters for deployments with more than one API process. */
export class UpstashRateLimitStore implements Store {
  readonly prefix = "buildscape:rate-limit:project-ai:v1";
  private windowMs = 10 * 60 * 1000;

  init(options: Options) {
    this.windowMs = options.windowMs;
  }

  async increment(key: string) {
    if (!redisClient) throw new Error("Shared rate limit storage is not configured");
    let result: [number, number];
    try {
      result = await redisClient.eval<[string], [number, number]>(
        incrementScript,
        [`${this.prefix}:${key}`],
        [String(this.windowMs)]
      );
    } catch {
      throw Object.assign(new Error("Shared rate limit storage is temporarily unavailable"), { statusCode: 503 });
    }
    const totalHits = Number(result[0]);
    const ttlMs = Math.max(0, Number(result[1]));
    return { totalHits, resetTime: new Date(Date.now() + ttlMs) };
  }

  async decrement(key: string) {
    if (!redisClient) return;
    await redisClient.decr(`${this.prefix}:${key}`);
  }

  async resetKey(key: string) {
    if (!redisClient) return;
    await redisClient.del(`${this.prefix}:${key}`);
  }
}
