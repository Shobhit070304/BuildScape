import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/Project";
// Use the frontend fallback as the single source for curated project content.
import projectsData from "../../../frontend/data/projects.json";

// Explicit seed command; server startup never clears or replaces this collection.
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  console.log(`\n📦 Seeding ${projectsData.length} projects into MongoDB:`);

  for (const p of projectsData as any[]) {
    await Project.findOneAndUpdate(
      { slug: p.slug },
      { $set: p },
      { upsert: true, new: true }
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
