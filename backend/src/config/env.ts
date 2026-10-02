export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
};

// Fail fast in production if critical secrets are missing.
if (env.NODE_ENV === "production") {
  const missing: string[] = [];
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// Warn in development if using insecure defaults.
if (env.NODE_ENV !== "production" && !env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set — tokens will be unsigned. Set it in .env");
}
