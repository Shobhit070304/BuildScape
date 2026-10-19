import mongoose from "mongoose";
import { env } from "./env";
import { syncProjectCatalog } from "../services/projectCatalog.service";
import { Project } from "../models/Project";

export async function connectDB() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured before the API can start");
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    // Drop persisted fields for removed public profiles and repository verification.
    await mongoose.connection.collection("users").updateMany(
      { $or: [{ username: { $exists: true } }, { role: { $exists: true } }] },
      { $unset: { username: "", role: "" } }
    );
    await mongoose.connection.collection("userprojectenrollments").updateMany(
      { $or: [
        { isVerified: { $exists: true } }, { githubRepoUrl: { $exists: true } },
        { liveDemoUrl: { $exists: true } }, { verifiedAt: { $exists: true } },
        { verificationChallenge: { $exists: true } },
      ] },
      { $unset: {
        isVerified: "", githubRepoUrl: "", liveDemoUrl: "", verifiedAt: "",
        verificationChallenge: "",
      } }
    );
    await Project.collection.updateMany(
      { $or: [
        { tasks: { $exists: true } }, { taskList: { $exists: true } },
        { taskLists: { $exists: true } }, { taskCount: { $exists: true } },
        { tasksCount: { $exists: true } }, { checklist: { $exists: true } },
      ] },
      { $unset: { tasks: "", taskList: "", taskLists: "", taskCount: "", tasksCount: "", checklist: "" } }
    );
    await syncProjectCatalog();
    console.log("✅ Canonical projects.json catalog synced");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}
