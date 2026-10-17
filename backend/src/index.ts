import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { protectAgainstCrossSiteWrites } from "./middleware/csrfProtection";
import { notFound } from "./middleware/notFound";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import usersRouter from "./routes/users";
import badgesRouter from "./routes/badges";

const app = express();

// Core middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(protectAgainstCrossSiteWrites);

// Routes
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/badges", badgesRouter);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect the database before accepting requests; startup never mutates project data.
connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });

export default app;

