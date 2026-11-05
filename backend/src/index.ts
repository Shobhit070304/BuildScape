import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env, validateEnv } from "./config/env";
import { connectDB } from "./config/db";
import { requestLogger } from "./middleware/requestLogger";
import { csrfProtection } from "./middleware/csrfProtection";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import usersRouter from "./routes/users";
import adminRouter from "./routes/admin";

validateEnv();

const app = express();
// Backend hosting platforms terminate TLS at one trusted reverse proxy.
app.set("trust proxy", 1);

// Core middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(csrfProtection);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(requestLogger);

// Routes
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Keep liveness available during a database outage; readiness stays false until MongoDB connects.
app.listen(env.PORT, () => {
  console.log(`🚀 Server listening on port ${env.PORT}`);
});

async function connectWithRetry(): Promise<void> {
  try {
    await connectDB();
  } catch (error) {
    console.error("❌ MongoDB connection failed; retrying in 5 seconds:", error);
    const retry = setTimeout(() => void connectWithRetry(), 5000);
    retry.unref();
  }
}

void connectWithRetry();

export default app;

