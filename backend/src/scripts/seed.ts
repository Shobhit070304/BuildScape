import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/Project";
import fs from "fs";
import path from "path";

// Explicit seed command; server startup never clears or replaces this collection.
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  // Prefer backend/data/projects.json, fallback to frontend/data/projects.json
  const backendJsonPath = path.resolve(__dirname, "../../data/projects.json");
  const frontendJsonPath = path.resolve(__dirname, "../../../frontend/data/projects.json");
  const jsonPath = fs.existsSync(backendJsonPath) ? backendJsonPath : frontendJsonPath;

  if (!fs.existsSync(jsonPath)) {
    console.error("❌ projects.json not found at:", jsonPath);
    process.exit(1);
  }

  const projectsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  console.log(`\n📦 Seeding ${projectsData.length} projects into MongoDB:`);

  for (const p of projectsData as any[]) {
    await Project.findOneAndUpdate(
      { slug: p.slug },
      { $set: p },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`  ✔ [${p.track}] ${p.title} (${p.phases?.length || 0} phases)`);
  }

  console.log(`\n✅ Successfully seeded ${projectsData.length} projects!`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
