import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/Project";
import projectsData from "../../../frontend/data/projects.json";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Clear existing projects
  await Project.deleteMany({});
  console.log("🗑️  Cleared existing projects");

  // Insert from JSON
  const projects = projectsData.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    track: p.track,
    difficulty: p.difficulty,
    estimatedHours: p.estimatedHours,
    techStack: p.techStack,
    phases: p.phases.map((ph: any) => ({
      id: ph.id,
      orderIndex: ph.orderIndex,
      title: ph.title,
      content: ph.content,
    })),
  }));

  await Project.insertMany(projects);
  console.log(`✅ Seeded ${projects.length} projects`);

  await mongoose.disconnect();
  console.log("👋 Done");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
