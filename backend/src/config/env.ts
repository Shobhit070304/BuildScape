export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "changeme-dev-secret",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
};
