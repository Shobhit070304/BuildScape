import "dotenv/config";
import mongoose from "mongoose";
import { syncProjectCatalog } from "../services/projectCatalog.service";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI must be configured before seeding");
  await mongoose.connect(uri);
  const projects = await syncProjectCatalog();
  console.log(`Synced ${projects.length} canonical projects from projects.json.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Project catalog sync failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
