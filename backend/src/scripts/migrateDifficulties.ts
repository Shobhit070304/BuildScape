import "dotenv/config";
import mongoose from "mongoose";
import { Project } from "../models/Project";

async function migrateDifficulties(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is required");

  await mongoose.connect(uri);
  try {
    const beginner = await Project.collection.updateMany(
      { difficulty: { $in: ["Entry", "Basic"] } },
      { $set: { difficulty: "Beginner" } }
    );
    const advanced = await Project.collection.updateMany(
      { difficulty: "Expert" },
      { $set: { difficulty: "Advanced" } }
    );
    const unsupported = await Project.collection.countDocuments({
      difficulty: { $nin: ["Beginner", "Intermediate", "Advanced"] },
    });

    if (unsupported > 0) {
      throw new Error(`${unsupported} project(s) have an unsupported difficulty; review them before deployment`);
    }

    console.log(`Difficulty migration complete (${beginner.modifiedCount + advanced.modifiedCount} project(s) updated).`);
  } finally {
    await mongoose.disconnect();
  }
}

migrateDifficulties().catch((error: unknown) => {
  console.error("Difficulty migration failed:", error);
  process.exitCode = 1;
});
