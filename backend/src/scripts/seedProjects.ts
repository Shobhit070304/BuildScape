import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Project } from "../models/Project";

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in backend/.env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Successfully connected to MongoDB\n");

  // Locate projects.json file
  const backendDataPath = path.resolve(__dirname, "../../data/projects.json");
  const frontendDataPath = path.resolve(__dirname, "../../../frontend/data/projects.json");

  let sourcePath = "";
  if (fs.existsSync(backendDataPath)) {
    sourcePath = backendDataPath;
  } else if (fs.existsSync(frontendDataPath)) {
    sourcePath = frontendDataPath;
  } else {
    console.error("❌ Could not find projects.json in backend/data or frontend/data");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`📄 Loading projects data from: ${sourcePath}`);
  const rawData = fs.readFileSync(sourcePath, "utf-8");
  const projects = JSON.parse(rawData);

  if (!Array.isArray(projects) || projects.length === 0) {
    console.error("❌ No projects found in JSON file");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`📦 Found ${projects.length} projects to process.\n`);

  console.log("🧹 Cleaning existing projects collection from MongoDB...");
  const deleteResult = await Project.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.deletedCount} existing project records from MongoDB.\n`);

  let newCount = 0;

  for (const p of projects) {
    await Project.create(p);
    console.log(`  ➕ [SEEDED] [${p.track} · ${p.difficulty}] ${p.title} (${p.phases?.length || 0} phases)`);
    newCount++;
  }

  const totalInDb = await Project.countDocuments();

  console.log("\n==========================================");
  console.log(`🎉 Seeding Complete!`);
  console.log(`   - Fresh seeded: ${newCount}`);
  console.log(`   - Total in DB:  ${totalInDb}`);
  console.log("==========================================\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB. Done.");
  process.exit(0);
}

runSeed().catch(async (err) => {
  console.error("❌ Seeding failed with error:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
