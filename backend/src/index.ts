import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";

// Buildscape Express Server
const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect to DB then start server
connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
});

export default app;

