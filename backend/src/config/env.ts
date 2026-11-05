export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT === undefined ? 4000 : Number(process.env.PORT),
  CORS_ORIGIN: process.env.CORS_ORIGIN?.trim() ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI?.trim() ?? "",
  JWT_SECRET: process.env.JWT_SECRET?.trim() ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? ""
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
  if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
}
