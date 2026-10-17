const nodeEnv = process.env.NODE_ENV ?? "development";
const configuredJwtSecret = process.env.JWT_SECRET?.trim();
const isPlaceholderSecret = Boolean(
  configuredJwtSecret && /^(your|change|replace|example|default|buildscape)|min-32-chars/i.test(configuredJwtSecret)
);

if (nodeEnv === "production" && (!configuredJwtSecret || configuredJwtSecret.length < 32 || isPlaceholderSecret)) {
  throw new Error("JWT_SECRET must be a non-placeholder secret with at least 32 characters in production");
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: configuredJwtSecret ?? "buildscape-session-secret-change-in-production",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? ""
};

// Log diagnostics on startup
if (env.NODE_ENV === "production") {
  if (!env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set! Database connection will fail.");
  }
  if (!env.GOOGLE_CLIENT_ID) {
    console.warn("⚠️  GOOGLE_CLIENT_ID is not set in environment. Google login will be disabled.");
  }
} else if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set — using dev default fallback.");
}
