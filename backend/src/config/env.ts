export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI?.trim() ?? "",
  JWT_SECRET: process.env.JWT_SECRET?.trim() ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? ""
};

export function validateEnv(): void {
  const missing = ["MONGODB_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"].filter((key) => !env[key as keyof typeof env]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
  if (env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
}
