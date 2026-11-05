export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT === undefined ? 4000 : Number(process.env.PORT),
  CORS_ORIGIN: process.env.CORS_ORIGIN?.trim() ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI?.trim() ?? "",
  JWT_SECRET: process.env.JWT_SECRET?.trim() ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
  GROQ_API_KEY: process.env.GROQ_API_KEY?.trim() ?? "",
  GROQ_MODEL: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "",
};

export function validateEnv(): void {
  if (!["development", "test", "production"].includes(env.NODE_ENV)) {
    throw new Error("NODE_ENV must be development, test, or production");
  }
  const missing = ["MONGODB_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"].filter((key) => !env[key as keyof typeof env]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
  if (env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  let corsOrigin: URL;
  try {
    corsOrigin = new URL(env.CORS_ORIGIN);
  } catch {
    throw new Error("CORS_ORIGIN must be a valid frontend origin");
  }
  if (!['http:', 'https:'].includes(corsOrigin.protocol) || corsOrigin.pathname !== "/" || corsOrigin.search || corsOrigin.hash) {
    throw new Error("CORS_ORIGIN must contain only an HTTP or HTTPS origin, without a path");
  }
  if (env.NODE_ENV === "production" && corsOrigin.protocol !== "https:") {
    throw new Error("CORS_ORIGIN must use HTTPS in production");
  }
  const hasRedisUrl = Boolean(env.UPSTASH_REDIS_REST_URL);
  const hasRedisToken = Boolean(env.UPSTASH_REDIS_REST_TOKEN);
  if (hasRedisUrl !== hasRedisToken) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together");
  }
  if (hasRedisUrl) {
    let redisUrl: URL;
    try {
      redisUrl = new URL(env.UPSTASH_REDIS_REST_URL);
    } catch {
      throw new Error("UPSTASH_REDIS_REST_URL must be a valid HTTPS URL");
    }
    if (redisUrl.protocol !== "https:") {
      throw new Error("UPSTASH_REDIS_REST_URL must use HTTPS");
    }
  }
  if (env.NODE_ENV === "production") {
    const missingAiServices = [
      !env.GROQ_API_KEY && "GROQ_API_KEY",
      !hasRedisUrl && "UPSTASH_REDIS_REST_URL",
      !hasRedisToken && "UPSTASH_REDIS_REST_TOKEN",
    ].filter(Boolean);
    if (missingAiServices.length) {
      throw new Error(`Missing production service variable(s): ${missingAiServices.join(", ")}`);
    }
  }
  if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
}
