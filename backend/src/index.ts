import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { protectAgainstCrossSiteWrites } from "./middleware/csrfProtection";
import { notFound } from "./middleware/notFound";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";

const app = express();

// Core middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use(protectAgainstCrossSiteWrites);

// Routes
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Load the canonical project catalog before accepting requests.
connectDB()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
    const shutdown = (signal: string) => {
      console.log(`${signal} received; closing API server`);
      server.close(() => {
        mongoose.disconnect()
          .then(() => process.exit(0))
          .catch((error) => { console.error("Graceful shutdown failed", error); process.exit(1); });
      });
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });

export default app;

