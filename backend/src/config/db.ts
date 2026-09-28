import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  if (!env.MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI not set — skipping DB connection");
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}
