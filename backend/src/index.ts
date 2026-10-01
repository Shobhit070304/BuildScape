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

// Connect to DB, clean projects collection and seed fresh all projects
connectDB().then(async () => {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const { Project } = await import("./models/Project");

    const dataPath = path.resolve(__dirname, "../data/projects.json");
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf-8");
      const projects = JSON.parse(raw);
      if (Array.isArray(projects) && projects.length > 0) {
        console.log("🧹 [BuildScape] Cleaning projects collection from MongoDB...");
        const delRes = await Project.deleteMany({});
        console.log(`🧹 [BuildScape] Cleaned ${delRes.deletedCount} old projects from collection.`);

        await Project.insertMany(projects);
        console.log(`✅ [BuildScape] Successfully fresh-seeded ${projects.length} complete projects into MongoDB!`);
      }
    }
  } catch (err) {
    console.error("❌ [BuildScape] Clean and seed failed:", err);
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
});

export default app;

