export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET || "buildscape-session-secret-change-in-production",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
};

// Log diagnostics on startup
if (env.NODE_ENV === "production") {
  if (!env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set! Database connection will fail.");
  }
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  JWT_SECRET is not set in environment. Set it in your deployment settings.");
  }
  if (!env.GOOGLE_CLIENT_ID) {
    console.warn("⚠️  GOOGLE_CLIENT_ID is not set in environment. Google login will be disabled.");
  }
} else if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set — using dev default fallback.");
}
